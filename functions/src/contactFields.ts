/**
 * `nameLower` and `sortKey` are written by the admin panel and the import
 * function, never by the app (handbook §3). This is the source of truth for
 * the import function; apps/mobile/src/utils/contactFields.ts mirrors the
 * same behaviour for its local mock fixtures (Metro can't resolve across
 * apps/ without extra monorepo config, so it isn't a shared import) — keep
 * the two in sync, the tests in both packages pin the exact behaviour.
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
