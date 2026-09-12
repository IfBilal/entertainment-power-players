import { describe, it } from 'jsr:@std/testing/bdd';
import { expect } from 'jsr:@std/expect';
import { computeNameLower, computeSortKey } from './contactFields.ts';

describe('computeNameLower', () => {
  it('lowercases and trims', () => {
    expect(computeNameLower('  Jane Doe  ')).toBe('jane doe');
  });
});

describe('computeSortKey', () => {
  it('strips leading articles', () => {
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
