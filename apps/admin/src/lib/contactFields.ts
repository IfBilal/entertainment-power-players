/**
 * `nameLower` and `sortKey` are written by the admin panel and the import
 * function, never by the app (handbook §3). This is the admin panel's copy —
 * deliberately duplicated from supabase/functions/import-contacts-csv/
 * contactFields.ts rather than shared via a cross-package import (Vite and
 * Deno resolve modules differently; a shared package isn't worth the build
 * complexity for ~20 lines). The unit tests in both packages pin identical
 * behaviour, so drift gets caught.
 */

const LEADING_ARTICLES = ['the', 'a', 'an'];

export function computeNameLower(name: string): string {
  return name.trim().toLowerCase();
}

export function computeSortKey(name: string): string {
  const stripped = name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  const words = stripped.split(' ');
  if (words.length > 1 && LEADING_ARTICLES.includes(words[0])) {
    return words.slice(1).join(' ');
  }
  return stripped;
}
