import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CategoriesPage } from './CategoriesPage';

describe('categories preview', () => {
  it('shows the approved five categories without the obsolete icon picker', () => {
    const html = renderToStaticMarkup(<CategoriesPage preview />);
    for (const label of ['Fashion', 'Film/TV', 'Gaming', 'Music', 'Sports']) expect(html).toContain(label);
    expect(html).toContain('Development preview only');
    expect(html).not.toContain('icon-grid');
    expect(html).not.toContain('trophy-outline');
  });
});
