import { describe, expect, it } from 'vitest';
import { diffQuestions, parseCsv, PUBLISH_TARGET, validateQuestionsCsv, type QuestionInput } from './questionsCsv';

const HEADER = 'category,challenge_group,number,question,answer,why,power_move';
const categories = new Map([
  ['fashion', 'fashion'],
  ['film/tv', 'film-tv'],
  ['film-tv', 'film-tv'],
]);

const row = (n: number, group = 'Know the Industry', category = 'Fashion') =>
  `${category},${group},${n},Question ${n}?,Answer ${n}.,Why ${n}.,Power move ${n}.`;

function fileWith(rows: string[], eol = '\n') {
  return [HEADER, ...rows].join(eol);
}

function fullFile(count = PUBLISH_TARGET) {
  const rows: string[] = [];
  for (let i = 1; i <= count; i++) rows.push(row(i, i <= 60 ? 'Know the Industry' : 'Know the Game'));
  return fileWith(rows);
}

describe('parseCsv', () => {
  it('strips a UTF-8 BOM and reads CRLF line endings', () => {
    const parsed = parseCsv('﻿a,b\r\n1,2\r\n');
    expect(parsed.rows).toEqual([['a', 'b'], ['1', '2']]);
    expect(parsed.errors).toEqual([]);
  });

  it('keeps commas and newlines inside quoted fields and unescapes doubled quotes', () => {
    const parsed = parseCsv('a,b\n"one, two","line1\nline2 ""quoted"""\n');
    expect(parsed.rows[1]).toEqual(['one, two', 'line1\nline2 "quoted"']);
    expect(parsed.lines[1]).toBe(2);
  });

  it('reports an unclosed quote instead of silently losing the rest of the file', () => {
    const parsed = parseCsv('a,b\n"open,value\n');
    expect(parsed.errors[0].message).toMatch(/Unclosed quote/);
    expect(parsed.errors[0].line).toBe(2);
  });

  it('ignores blank trailing lines', () => {
    expect(parseCsv('a\n1\n\n\n').rows).toEqual([['a'], ['1']]);
  });
});

describe('validateQuestionsCsv', () => {
  it('reports a missing required column and stops', () => {
    const report = validateQuestionsCsv('category,challenge_group,number,question,answer,why\nFashion,G,1,q,a,w', categories);
    expect(report.errors).toContain('Missing column: power_move');
    expect(report.valid).toEqual([]);
  });

  it('reports an unmapped column', () => {
    const report = validateQuestionsCsv(`${HEADER},source_note\n${row(1)},x`, categories);
    expect(report.errors).toContain('Unmapped column: source_note');
  });

  it('rejects an unknown category with the row and line', () => {
    const report = validateQuestionsCsv(fileWith([row(1, 'G', 'Cooking')]), categories);
    expect(report.errors).toContain('Row 1 (line 2): category "Cooking" is not configured');
  });

  it('accepts a category by display name or slug in any case', () => {
    const report = validateQuestionsCsv(fileWith([row(1, 'G', 'FILM/TV'), row(2, 'G', 'film-tv')]), categories);
    expect(report.valid.map((q) => q.category_slug)).toEqual(['film-tv', 'film-tv']);
  });

  it('rejects a non-integer number such as 3.5', () => {
    const report = validateQuestionsCsv(fileWith([row(1).replace(',1,', ',3.5,')]), categories);
    expect(report.errors.join('\n')).toContain('number "3.5" must be a positive whole number');
  });

  it('rejects blank required fields', () => {
    const report = validateQuestionsCsv(fileWith(['Fashion,G,1,,Answer,Why,Move']), categories);
    expect(report.errors).toContain('Row 1 (line 2): question is empty');
  });

  it('reports duplicate natural keys and names both rows', () => {
    const report = validateQuestionsCsv(fileWith([row(4), row(4)]), categories);
    expect(report.errors).toContain('Row 2 (line 3): duplicates row 1 (Fashion / Know the Industry / 4)');
  });

  it('treats group names that differ only by case or spacing as the same group', () => {
    const report = validateQuestionsCsv(fileWith([row(4, 'Know  the Industry'), row(4, 'know the industry')]), categories);
    expect(report.errors.some((e) => e.includes('duplicates row 1'))).toBe(true);
  });

  it('does not write a half-valid result: the target gate fails with a count message', () => {
    const report = validateQuestionsCsv(fileWith([row(1), row(2)]), categories);
    expect(report.meetsTarget).toBe(false);
    expect(report.errors).toContain('2 distinct valid rows; 125 required for publication');
  });

  it('accepts a synthetic 125-row file and reports category totals', () => {
    const report = validateQuestionsCsv(fullFile(), categories);
    expect(report.errors).toEqual([]);
    expect(report.meetsTarget).toBe(true);
    expect(report.categoryTotals).toEqual({ fashion: 125 });
  });

  it('gives the same valid set regardless of row order', () => {
    const rows: string[] = [];
    for (let i = 1; i <= PUBLISH_TARGET; i++) rows.push(row(i));
    const forward = validateQuestionsCsv(fileWith(rows), categories);
    const reversed = validateQuestionsCsv(fileWith([...rows].reverse()), categories);
    const keys = (list: QuestionInput[]) => list.map((q) => q.number).sort((a, b) => a - b);
    expect(keys(reversed.valid)).toEqual(keys(forward.valid));
  });

  it('keeps quoted punctuation and newlines in the stored text', () => {
    const report = validateQuestionsCsv(fileWith(['Fashion,G,1,"Who said ""hi""?","Line one\nline two","Why, really",Move']), categories);
    expect(report.valid[0].answer).toBe('Line one\nline two');
    expect(report.valid[0].question).toBe('Who said "hi"?');
    expect(report.valid[0].why).toBe('Why, really');
  });
});

describe('diffQuestions', () => {
  const base: QuestionInput = { category_slug: 'fashion', challenge_group: 'Know the Industry', number: 1, question: 'Q', answer: 'A', why: 'W', power_move: 'P' };

  it('creates missing rows, updates changed rows and skips identical ones', () => {
    const stored = [
      { id: 'id-1', ...base },
      { id: 'id-2', ...base, number: 2, answer: 'old' },
    ];
    const incoming = [base, { ...base, number: 2, answer: 'new' }, { ...base, number: 3 }];
    const diff = diffQuestions(incoming, stored);
    expect(diff.unchanged).toBe(1);
    expect(diff.update).toEqual([{ ...incoming[1], id: 'id-2' }]);
    expect(diff.create).toEqual([incoming[2]]);
  });

  it('an exact re-upload is idempotent: nothing to create or update', () => {
    const report = validateQuestionsCsv(fullFile(), categories);
    const stored = report.valid.map((q, i) => ({ id: `id-${i}`, ...q }));
    const diff = diffQuestions(report.valid, stored);
    expect(diff.create).toEqual([]);
    expect(diff.update).toEqual([]);
    expect(diff.unchanged).toBe(PUBLISH_TARGET);
  });
});
