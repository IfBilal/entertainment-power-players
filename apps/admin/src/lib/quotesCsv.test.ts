import { describe, expect, it } from 'vitest';
import { diffQuotes, quoteFingerprint, validateQuotesCsv } from './quotesCsv';

const HEADER = 'text,author,order,category,source';
const categories = new Map([['fashion', 'fashion']]);

const row = (n: number) => `Quote number ${n},Author ${n},${n},,`;

describe('validateQuotesCsv', () => {
  it('rejects a missing required column', () => {
    const report = validateQuotesCsv('author,order\nSomeone,1', categories);
    expect(report.errors).toContain('Missing column: text');
  });

  it('rejects blank text or author', () => {
    const report = validateQuotesCsv(`${HEADER}\n,Someone,,,\nSomething,,,,`, categories);
    expect(report.errors).toContain('Row 1 (line 2): text is empty');
    expect(report.errors).toContain('Row 2 (line 3): author is empty');
  });

  it('rejects a non-integer order', () => {
    const report = validateQuotesCsv(`${HEADER}\nQuote,Author,one,,`, categories);
    expect(report.errors.join('\n')).toContain('order "one" must be a positive whole number');
  });

  it('rejects an unconfigured category but allows a blank one', () => {
    const report = validateQuotesCsv(`${HEADER}\nQuote,Author,,Nope,\nQuote 2,Author 2,,,`, categories);
    expect(report.errors).toContain('Row 1 (line 2): category "Nope" is not configured');
    expect(report.valid).toHaveLength(1);
    expect(report.valid[0].categorySlug).toBeNull();
  });

  it('resolves a configured category to its slug', () => {
    const report = validateQuotesCsv(`${HEADER}\nQuote,Author,,Fashion,`, categories);
    expect(report.valid[0].categorySlug).toBe('fashion');
  });

  it('normalizes whitespace without touching punctuation', () => {
    const report = validateQuotesCsv(`${HEADER}\n"Do   it —  now!","  Jane   Doe ",,,`, categories);
    expect(report.valid[0].text).toBe('Do it — now!');
    expect(report.valid[0].author).toBe('Jane Doe');
  });

  it('flags a duplicate text+author pair within the file, case- and space-insensitively', () => {
    const report = validateQuotesCsv(`${HEADER}\nSame quote,Same Author,,,\n"same   quote","same author",,,`, categories);
    expect(report.errors.some((e) => e.includes('duplicates another row in this file'))).toBe(true);
    expect(report.valid).toHaveLength(1);
  });

  it('accepts a synthetic batch regardless of row order', () => {
    const rows = Array.from({ length: 50 }, (_, i) => row(i + 1));
    const forward = validateQuotesCsv(`${HEADER}\n${rows.join('\n')}`, categories);
    const reversed = validateQuotesCsv(`${HEADER}\n${[...rows].reverse().join('\n')}`, categories);
    expect(forward.distinctValid).toBe(50);
    expect(reversed.distinctValid).toBe(50);
  });
});

describe('diffQuotes', () => {
  it('creates new quotes and marks exact content matches as duplicates', () => {
    const existing = new Set([quoteFingerprint('Already here.', 'Someone')]);
    const incoming = [
      { text: 'Already here.', author: 'Someone', order: null, categorySlug: null, source: null },
      { text: 'Brand new.', author: 'Someone Else', order: null, categorySlug: null, source: null },
    ];
    const diff = diffQuotes(incoming, existing);
    expect(diff.duplicate).toEqual([incoming[0]]);
    expect(diff.create).toEqual([incoming[1]]);
  });

  it('an exact re-upload of the whole file is idempotent: nothing left to create', () => {
    const report = validateQuotesCsv(`${HEADER}\n${Array.from({ length: 10 }, (_, i) => row(i + 1)).join('\n')}`, categories);
    const existing = new Set(report.valid.map((q) => quoteFingerprint(q.text, q.author)));
    const diff = diffQuotes(report.valid, existing);
    expect(diff.create).toEqual([]);
    expect(diff.duplicate).toHaveLength(10);
  });
});
