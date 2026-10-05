import { describe, expect, it } from 'vitest';
import { canonicalCategoryIcon } from './categoryIcons';

describe('supervisor category icons', () => {
  it('uses only the five approved category pictograms', () => {
    expect(canonicalCategoryIcon('fashion')).toBe('sunglasses');
    expect(canonicalCategoryIcon('film-tv')).toBe('film-outline');
    expect(canonicalCategoryIcon('gaming')).toBe('game-controller-outline');
    expect(canonicalCategoryIcon('music')).toBe('musical-notes-outline');
    expect(canonicalCategoryIcon('sports')).toBe('basketball-outline');
    expect(canonicalCategoryIcon('unknown')).toBe('shapes-outline');
  });
});
