/**
 * `nameLower` and `sortKey` are written by the admin panel and the CSV import
 * function, never by the app (handbook §3) — but the mobile mock fixtures need
 * the same derivation to look and sort correctly, so the pure logic lives here
 * and is mirrored (not imported across apps — Metro doesn't resolve outside
 * apps/mobile without extra monorepo config) in functions/src/contactFields.ts.
 * Keep the two in sync; the sortKey/nameLower unit tests in each package pin
 * the exact behaviour so drift is caught.
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
