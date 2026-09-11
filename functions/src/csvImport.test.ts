import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chunk, parseContactsCsv } from './csvImport';

const sampleCsv = readFileSync(join(__dirname, '../../docs/contacts-import-template.csv'), 'utf8');

describe('parseContactsCsv against the real sample template', () => {
  it('imports all three sample rows with no unmapped columns', () => {
    const report = parseContactsCsv(sampleCsv);
    expect(report.unmappedColumns).toEqual([]);
    expect(report.skipped).toEqual([]);
    expect(report.imported).toHaveLength(3);
  });

  it('derives nameLower and sortKey server-side for every row', () => {
    const report = parseContactsCsv(sampleCsv);
    const jane = report.imported.find((c) => c.name === 'Jane Doe');
    expect(jane).toMatchObject({ nameLower: 'jane doe', sortKey: 'jane doe', categorySlug: 'fashion' });
  });

  it('treats a missing optional field (John Smith has no email) as undefined, not empty string', () => {
    const report = parseContactsCsv(sampleCsv);
    const john = report.imported.find((c) => c.name === 'John Smith');
    expect(john?.email).toBeUndefined();
    expect(john?.categorySlug).toBe('film-tv');
  });
});

describe('parseContactsCsv column mapping', () => {
  it('reports a column not in the known set, and still imports valid rows', () => {
    const csv = 'name,category,role,extra_column\nJane Doe,Fashion,Stylist,unexpected value\n';
    const report = parseContactsCsv(csv);
    expect(report.unmappedColumns).toEqual(['extra_column']);
    expect(report.imported).toHaveLength(1);
  });

  it('does not report a known column as unmapped', () => {
    const csv = 'name,category,role,company,email,phone,website,city,notes\nJane Doe,Fashion,Stylist,,,,,,\n';
    const report = parseContactsCsv(csv);
    expect(report.unmappedColumns).toEqual([]);
  });
});

describe('parseContactsCsv validation', () => {
  it('skips a row missing name, with the row number and reason', () => {
    const csv = 'name,category,role\n,Fashion,Stylist\n';
    const report = parseContactsCsv(csv);
    expect(report.imported).toHaveLength(0);
    expect(report.skipped).toEqual([{ row: 2, reason: 'Missing required field: name' }]);
  });

  it('skips a row missing category', () => {
    const csv = 'name,category,role\nJane Doe,,Stylist\n';
    const report = parseContactsCsv(csv);
    expect(report.skipped).toEqual([{ row: 2, reason: 'Missing required field: category' }]);
  });

  it('skips a row with an invalid email but keeps other valid rows', () => {
    const csv = 'name,category,role,email\nJane Doe,Fashion,Stylist,not-an-email\nJohn Smith,Fashion,Stylist,john@example.com\n';
    const report = parseContactsCsv(csv);
    expect(report.imported).toHaveLength(1);
    expect(report.imported[0].name).toBe('John Smith');
    expect(report.skipped).toEqual([{ row: 2, reason: 'Invalid email: "not-an-email"' }]);
  });

  it('rejects an unknown category when a valid set is supplied', () => {
    const csv = 'name,category,role\nJane Doe,NotARealCategory,Stylist\n';
    const report = parseContactsCsv(csv, new Set(['fashion', 'music']));
    expect(report.imported).toHaveLength(0);
    expect(report.skipped[0].reason).toContain('Unknown category');
  });

  it('accepts a known category when a valid set is supplied', () => {
    const csv = 'name,category,role\nJane Doe,Fashion,Stylist\n';
    const report = parseContactsCsv(csv, new Set(['fashion', 'music']));
    expect(report.imported).toHaveLength(1);
  });
});

describe('chunk', () => {
  it('splits into batches of the given size, keeping the remainder in its own chunk', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns a single chunk when items fit within size', () => {
    expect(chunk([1, 2], 500)).toEqual([[1, 2]]);
  });

  it('returns an empty array for an empty input', () => {
    expect(chunk([], 500)).toEqual([]);
  });
});
