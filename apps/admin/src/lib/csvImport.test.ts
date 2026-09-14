import { describe, it, expect } from 'vitest';
import { computeNameLower, computeSortKey } from './contactFields';
import { chunk, parseCsv, slugifyCategory, suggestMapping, validateRows } from './csvImport';

const SAMPLE_CSV = `name,category,role,company,email,phone,website,city,notes
Jane Doe,Fashion,Casting Director,Example Casting,jane@example.com,+1 212 555 0101,https://example.com,New York,Accepts submissions by email only
John Smith,Film/TV,Development Executive,Example Studios,,+1 310 555 0102,https://example.com,Los Angeles,
Aisha Khan,Music,A&R Manager,Example Records,aisha@example.com,,,London,
`;

/**
 * These mirror supabase/functions/import-contacts-csv/csvImport.test.ts on
 * purpose — the admin panel carries its own copy of this logic (Vite vs Deno
 * module resolution), so identical tests on both sides catch drift.
 */
describe('contactFields (must match the Edge Function copy)', () => {
  it('lowercases and trims for nameLower', () => {
    expect(computeNameLower('  Jane Doe  ')).toBe('jane doe');
  });

  it('strips leading articles for sortKey', () => {
    expect(computeSortKey('The Weeknd Management Group')).toBe('weeknd management group');
    expect(computeSortKey('A Star Is Born Productions')).toBe('star is born productions');
    expect(computeSortKey('An Example Company')).toBe('example company');
  });

  it('strips punctuation and normalises whitespace', () => {
    expect(computeSortKey("O'Brien & Sons, Inc.")).toBe('obrien sons inc');
  });

  it('leaves names without leading articles alone', () => {
    expect(computeSortKey('Jane Doe')).toBe('jane doe');
  });
});

describe('parseCsv + suggestMapping', () => {
  it('reads headers and rows from the real sample template', () => {
    const parsed = parseCsv(SAMPLE_CSV);
    expect(parsed.headers).toEqual(['name', 'category', 'role', 'company', 'email', 'phone', 'website', 'city', 'notes']);
    expect(parsed.rows).toHaveLength(3);
  });

  it('auto-maps headers that already match known column names', () => {
    const parsed = parseCsv(SAMPLE_CSV);
    const mapping = suggestMapping(parsed.headers);
    expect(mapping.name).toBe('name');
    expect(mapping.category).toBe('category');
    expect(mapping.notes).toBe('notes');
  });

  it('leaves unrecognised headers unmapped for the user to resolve', () => {
    const parsed = parseCsv('name,category,mystery_column\nJane Doe,Fashion,whatever\n');
    const mapping = suggestMapping(parsed.headers);
    expect(mapping.mystery_column).toBeNull();
  });
});

describe('validateRows', () => {
  it('accepts the real sample template with no skips', () => {
    const parsed = parseCsv(SAMPLE_CSV);
    const report = validateRows(parsed, suggestMapping(parsed.headers));
    expect(report.skipped).toEqual([]);
    expect(report.valid).toHaveLength(3);
    expect(report.unmappedColumns).toEqual([]);
  });

  it('derives name_lower and sort_key rather than trusting input', () => {
    const parsed = parseCsv(SAMPLE_CSV);
    const report = validateRows(parsed, suggestMapping(parsed.headers));
    const jane = report.valid.find((c) => c.name === 'Jane Doe');
    expect(jane).toMatchObject({ name_lower: 'jane doe', sort_key: 'jane doe', category_slug: 'fashion' });
  });

  it('reports an unmapped column instead of silently dropping it', () => {
    const parsed = parseCsv('name,category,extra_column\nJane Doe,Fashion,unexpected\n');
    const report = validateRows(parsed, suggestMapping(parsed.headers));
    expect(report.unmappedColumns).toEqual(['extra_column']);
    expect(report.valid).toHaveLength(1);
  });

  it('skips a row missing name, naming the row number', () => {
    const parsed = parseCsv('name,category\n,Fashion\n');
    const report = validateRows(parsed, suggestMapping(parsed.headers));
    expect(report.valid).toHaveLength(0);
    expect(report.skipped).toEqual([{ row: 2, reason: 'Missing required field: name' }]);
  });

  it('skips a row missing category', () => {
    const parsed = parseCsv('name,category\nJane Doe,\n');
    const report = validateRows(parsed, suggestMapping(parsed.headers));
    expect(report.skipped).toEqual([{ row: 2, reason: 'Missing required field: category' }]);
  });

  it('imports valid rows even when others fail', () => {
    const parsed = parseCsv('name,category,email\nBad Row,Fashion,not-an-email\nGood Row,Fashion,good@example.com\n');
    const report = validateRows(parsed, suggestMapping(parsed.headers));
    expect(report.valid).toHaveLength(1);
    expect(report.valid[0].name).toBe('Good Row');
    expect(report.skipped).toEqual([{ row: 2, reason: 'Invalid email: "not-an-email"' }]);
  });

  it('rejects categories that do not exist when a valid set is supplied', () => {
    const parsed = parseCsv('name,category\nJane Doe,NotARealCategory\n');
    const report = validateRows(parsed, suggestMapping(parsed.headers), new Set(['fashion', 'music']));
    expect(report.valid).toHaveLength(0);
    expect(report.skipped[0].reason).toContain('Unknown category');
  });

  it('honours a manual remapping of a differently-named column', () => {
    const parsed = parseCsv('full_name,category\nJane Doe,Fashion\n');
    // User maps "full_name" -> "name" in the UI.
    const report = validateRows(parsed, { full_name: 'name', category: 'category' });
    expect(report.valid).toHaveLength(1);
    expect(report.valid[0].name).toBe('Jane Doe');
    expect(report.unmappedColumns).toEqual([]);
  });
});

describe('slugifyCategory', () => {
  it('matches the slugs used in the database', () => {
    expect(slugifyCategory('Film/TV')).toBe('film-tv');
    expect(slugifyCategory('Fashion')).toBe('fashion');
    expect(slugifyCategory('  Music  ')).toBe('music');
  });
});

describe('chunk', () => {
  it('splits into batches, remainder in its own chunk', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns one chunk when everything fits', () => {
    expect(chunk([1, 2], 500)).toEqual([[1, 2]]);
  });

  it('returns nothing for an empty list', () => {
    expect(chunk([], 500)).toEqual([]);
  });
});
