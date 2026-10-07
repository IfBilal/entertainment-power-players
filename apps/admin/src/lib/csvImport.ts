import Papa from 'papaparse';
import { computeNameLower, computeSortKey } from './contactFields';

/**
 * Columns this importer understands, matching docs/contacts-import-template.csv.
 * Any CSV header not mapped to one of these is reported rather than silently
 * dropped (handbook §5 / §6 Week 1).
 */
export const KNOWN_COLUMNS = ['name', 'category', 'role', 'company', 'email', 'phone', 'website', 'city', 'notes'] as const;
export type KnownColumn = (typeof KNOWN_COLUMNS)[number];

/** CSV header -> known column. Unmapped headers map to `null`. */
export type ColumnMapping = Record<string, KnownColumn | null>;

export type ContactDraft = {
  name: string;
  name_lower: string;
  sort_key: string;
  category_slug: string;
  role: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  city: string | null;
  notes: string | null;
  active: true;
  /** 1-based CSV row this came from, for the duplicate report and for resuming a partial import. */
  row: number;
  /** Same name + category as a row already in the directory, or an earlier row in this file. */
  isDuplicate: boolean;
  duplicateReason: string | null;
};

/** `name_lower|category_slug` -- the normalized key duplicate matching is done on. */
export function duplicateKey(nameLower: string, categorySlug: string): string {
  return `${nameLower}|${categorySlug}`;
}

export type RowError = { row: number; reason: string };

export type ParsedCsv = {
  headers: string[];
  /** Raw rows exactly as parsed, for the preview table. */
  rows: Array<Record<string, string>>;
};

export type ValidationReport = {
  valid: ContactDraft[];
  skipped: RowError[];
  unmappedColumns: string[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function slugifyCategory(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseCsv(csvText: string): ParsedCsv {
  // skipEmptyLines would otherwise drop a blank line from `data` entirely,
  // which shifts every later row's array index away from its real line
  // number -- an admin "fixing row 14" would be looking at the wrong line.
  // validateRows() filters blank rows itself, after row numbers are fixed.
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: false,
    transformHeader: (h) => h.trim(),
  });
  return {
    headers: parsed.meta.fields ?? [],
    rows: parsed.data,
  };
}

/**
 * Best-effort initial mapping: a header maps to itself when it's already a
 * known column name (case-insensitive). Everything else starts unmapped for
 * the user to resolve in the column-mapping step.
 */
export function suggestMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const header of headers) {
    const normalized = header.trim().toLowerCase();
    const match = KNOWN_COLUMNS.find((c) => c === normalized);
    mapping[header] = match ?? null;
  }
  return mapping;
}

/**
 * Applies the mapping and validates. Valid rows are returned even when others
 * fail (handbook §5: "Valid rows import even if others fail"), and failures
 * are reported by their 1-based CSV row number so the error report can name
 * them.
 */
export function validateRows(
  parsed: ParsedCsv,
  mapping: ColumnMapping,
  validCategorySlugs?: Set<string>,
  /** `name_lower|category_slug` keys already present in the directory (active or not). */
  existingContactKeys?: Set<string>,
): ValidationReport {
  const unmappedColumns = parsed.headers.filter((h) => !mapping[h]);
  const valid: ContactDraft[] = [];
  const skipped: RowError[] = [];
  const seenInFile = new Map<string, number>(); // key -> first row number it appeared on

  const columnFor = (target: KnownColumn): string | undefined =>
    parsed.headers.find((h) => mapping[h] === target);

  const nameCol = columnFor('name');
  const categoryCol = columnFor('category');
  const roleCol = columnFor('role');

  parsed.rows.forEach((raw, index) => {
    const row = index + 2; // +1 for zero-index, +1 for the header row
    // A genuinely blank physical line (including the phantom trailing row a
    // final newline produces) -- skip it without reporting an error, same as
    // the old skipEmptyLines:true behavior, now with correct row numbers for
    // every real row around it.
    if (Object.values(raw).every((v) => !v || !v.trim())) return;

    const read = (col: string | undefined) => (col ? (raw[col] ?? '').trim() : '');

    const name = read(nameCol);
    const category = read(categoryCol);

    if (!name) {
      skipped.push({ row, reason: 'Missing required field: name' });
      return;
    }
    if (!category) {
      skipped.push({ row, reason: 'Missing required field: category' });
      return;
    }

    const categorySlug = slugifyCategory(category);
    if (validCategorySlugs && !validCategorySlugs.has(categorySlug)) {
      skipped.push({ row, reason: `Unknown category: "${category}"` });
      return;
    }

    const email = read(columnFor('email'));
    if (email && !EMAIL_RE.test(email)) {
      skipped.push({ row, reason: `Invalid email: "${email}"` });
      return;
    }

    const nameLower = computeNameLower(name);
    const key = duplicateKey(nameLower, categorySlug);
    let isDuplicate = false;
    let duplicateReason: string | null = null;
    const firstRow = seenInFile.get(key);
    if (firstRow !== undefined) {
      isDuplicate = true;
      duplicateReason = `Same name and category as row ${firstRow} in this file`;
    } else if (existingContactKeys?.has(key)) {
      isDuplicate = true;
      duplicateReason = 'Same name and category as a contact already in the directory';
    } else {
      seenInFile.set(key, row);
    }

    valid.push({
      name,
      name_lower: nameLower,
      sort_key: computeSortKey(name),
      category_slug: categorySlug,
      role: read(roleCol),
      company: read(columnFor('company')) || null,
      email: email || null,
      phone: read(columnFor('phone')) || null,
      website: read(columnFor('website')) || null,
      city: read(columnFor('city')) || null,
      notes: read(columnFor('notes')) || null,
      active: true,
      row,
      isDuplicate,
      duplicateReason,
    });
  });

  return { valid, skipped, unmappedColumns };
}

/** Keeps batch writes under the 500-row limit (handbook §5). */
export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}
