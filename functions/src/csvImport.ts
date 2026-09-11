import Papa from 'papaparse';
import { computeNameLower, computeSortKey } from './contactFields';

/**
 * Columns this importer understands, matching docs/contacts-import-template.csv
 * exactly. Any CSV header not in this set is reported in `unmappedColumns`
 * rather than silently dropped (handbook §1 Week 1 requirement).
 */
export const KNOWN_COLUMNS = ['name', 'category', 'role', 'company', 'email', 'phone', 'website', 'city', 'notes'] as const;
type KnownColumn = (typeof KNOWN_COLUMNS)[number];

export type ContactRecord = {
  name: string;
  nameLower: string;
  sortKey: string;
  categorySlug: string;
  role: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  notes?: string;
  active: true;
};

export type RowError = { row: number; reason: string };

export type ImportReport = {
  imported: ContactRecord[];
  skipped: RowError[];
  unmappedColumns: string[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slugifyCategory(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parses and validates a CSV against the known contact shape, deriving
 * `nameLower`/`sortKey` server-side. `validCategorySlugs`, when given,
 * additionally rejects rows whose category doesn't match a real category —
 * omit it (or pass undefined) to accept any non-empty category, useful for
 * a first import before categories exist.
 */
export function parseContactsCsv(csvText: string, validCategorySlugs?: Set<string>): ImportReport {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const headers = parsed.meta.fields ?? [];
  const unmappedColumns = headers.filter((h) => !KNOWN_COLUMNS.includes(h as KnownColumn));

  const imported: ContactRecord[] = [];
  const skipped: RowError[] = [];

  parsed.data.forEach((raw, index) => {
    const row = index + 2; // +1 for 0-index, +1 for the header row
    const name = (raw.name ?? '').trim();
    const category = (raw.category ?? '').trim();
    const role = (raw.role ?? '').trim();

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

    const email = (raw.email ?? '').trim();
    if (email && !EMAIL_RE.test(email)) {
      skipped.push({ row, reason: `Invalid email: "${email}"` });
      return;
    }

    imported.push({
      name,
      nameLower: computeNameLower(name),
      sortKey: computeSortKey(name),
      categorySlug,
      role,
      company: (raw.company ?? '').trim() || undefined,
      email: email || undefined,
      phone: (raw.phone ?? '').trim() || undefined,
      website: (raw.website ?? '').trim() || undefined,
      city: (raw.city ?? '').trim() || undefined,
      notes: (raw.notes ?? '').trim() || undefined,
      active: true,
    });
  });

  return { imported, skipped, unmappedColumns };
}

/** Splits an array into chunks of at most `size` — used to keep Firestore batch writes under the 500-op limit (handbook §5). */
export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}
