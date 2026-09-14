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
};

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
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
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
): ValidationReport {
  const unmappedColumns = parsed.headers.filter((h) => !mapping[h]);
  const valid: ContactDraft[] = [];
  const skipped: RowError[] = [];

  const columnFor = (target: KnownColumn): string | undefined =>
    parsed.headers.find((h) => mapping[h] === target);

  const nameCol = columnFor('name');
  const categoryCol = columnFor('category');
  const roleCol = columnFor('role');

  parsed.rows.forEach((raw, index) => {
    const row = index + 2; // +1 for zero-index, +1 for the header row
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

    valid.push({
      name,
      name_lower: computeNameLower(name),
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
