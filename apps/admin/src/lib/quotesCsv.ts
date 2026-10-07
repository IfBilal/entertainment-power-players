/**
 * Quote CSV import: parse, validate and diff against stored rows.
 *
 * Quotes have no natural key besides their content, unlike questions'
 * category/group/number. So a bulk import here only ever creates new rows
 * or skips an exact duplicate (matched by the same normalized fingerprint
 * the database itself computes and enforces as unique). Editing an existing
 * quote's wording stays a single-row action on the Quotes page, which keeps
 * its id -- and so its `quote_favorites` and share links -- unchanged.
 */
import { parseCsv } from './questionsCsv';

export const QUOTE_HEADERS = ['text', 'author', 'order', 'category', 'source'] as const;
export const QUOTE_REQUIRED_HEADERS = ['text', 'author'] as const;
export const PUBLISH_TARGET = 225;
const MAX_FIELD_LENGTH = 2000;

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');
export const quoteFingerprint = (text: string, author: string) => `${normalize(text).toLowerCase()}|${normalize(author).toLowerCase()}`;

export type QuoteInput = {
  text: string;
  author: string;
  order: number | null;
  categorySlug: string | null;
  source: string | null;
};

export type QuoteValidationReport = {
  valid: QuoteInput[];
  errors: string[];
  distinctValid: number;
  meetsTarget: boolean;
};

/** Validates the parsed file against the template headers and the configured categories (optional). */
export function validateQuotesCsv(text: string, categories: Map<string, string>): QuoteValidationReport {
  const parsed = parseCsv(text);
  const errors: string[] = parsed.errors.map((e) => `Line ${e.line}: ${e.message}`);
  const valid: QuoteInput[] = [];
  const seen = new Set<string>();

  if (parsed.rows.length === 0) {
    errors.push('The file is empty.');
    return { valid, errors, distinctValid: 0, meetsTarget: false };
  }

  const header = parsed.rows[0].map((h) => h.trim());
  const headerCounts = new Map<string, number>();
  header.forEach((h) => headerCounts.set(h, (headerCounts.get(h) ?? 0) + 1));
  for (const required of QUOTE_REQUIRED_HEADERS) {
    if (!headerCounts.has(required)) errors.push(`Missing column: ${required}`);
  }
  for (const [name, count] of headerCounts) {
    if (count > 1) errors.push(`Duplicate column: ${name}`);
    if (!(QUOTE_HEADERS as readonly string[]).includes(name)) errors.push(`Unmapped column: ${name}`);
  }
  if (errors.length > 0) return { valid, errors, distinctValid: 0, meetsTarget: false };

  const col = (name: string) => header.indexOf(name);
  const get = (cells: string[], name: string) => (col(name) === -1 ? '' : (cells[col(name)] ?? '')).trim();

  for (let r = 1; r < parsed.rows.length; r++) {
    const cells = parsed.rows[r];
    const where = `Row ${r} (line ${parsed.lines[r]})`;
    const before = errors.length;

    const rawText = get(cells, 'text');
    const rawAuthor = get(cells, 'author');
    if (!rawText) errors.push(`${where}: text is empty`);
    else if (rawText.length > MAX_FIELD_LENGTH) errors.push(`${where}: text is longer than ${MAX_FIELD_LENGTH} characters`);
    if (!rawAuthor) errors.push(`${where}: author is empty`);

    const orderRaw = get(cells, 'order');
    let order: number | null = null;
    if (orderRaw) {
      if (!/^\d+$/.test(orderRaw) || Number(orderRaw) < 1) errors.push(`${where}: order "${orderRaw}" must be a positive whole number`);
      else order = Number(orderRaw);
    }

    const categoryRaw = get(cells, 'category');
    let categorySlug: string | null = null;
    if (categoryRaw) {
      const slug = categories.get(categoryRaw.toLowerCase());
      if (!slug) errors.push(`${where}: category "${categoryRaw}" is not configured`);
      else categorySlug = slug;
    }

    if (errors.length > before) continue;

    const normalizedText = normalize(rawText);
    const normalizedAuthor = normalize(rawAuthor);
    const key = quoteFingerprint(normalizedText, normalizedAuthor);
    if (seen.has(key)) {
      errors.push(`${where}: duplicates another row in this file (same text and author)`);
      continue;
    }
    seen.add(key);

    valid.push({ text: normalizedText, author: normalizedAuthor, order, categorySlug, source: get(cells, 'source') || null });
  }

  const distinctValid = valid.length;
  return { valid, errors, distinctValid, meetsTarget: distinctValid >= 1 };
}

export type QuoteDiff = { create: QuoteInput[]; duplicate: QuoteInput[] };

/** `existingFingerprints` comes straight from the database's own generated `content_fingerprint` column. */
export function diffQuotes(incoming: QuoteInput[], existingFingerprints: Set<string>): QuoteDiff {
  const create: QuoteInput[] = [];
  const duplicate: QuoteInput[] = [];
  for (const q of incoming) {
    if (existingFingerprints.has(quoteFingerprint(q.text, q.author))) duplicate.push(q);
    else create.push(q);
  }
  return { create, duplicate };
}
