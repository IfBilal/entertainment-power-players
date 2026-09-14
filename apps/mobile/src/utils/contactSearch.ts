import type { Contact } from '../services/supabase/directory';

export type ContactFilters = {
  role?: string;
  city?: string;
};

/**
 * Prefix match on nameLower, plus substring match on company/role (handbook §4.2).
 * Pure function so it's unit-testable without rendering anything.
 */
export function searchContacts(contacts: Contact[], query: string): Contact[] {
  const q = query.trim().toLowerCase();
  if (!q) return contacts;
  return contacts.filter(
    (c) =>
      c.nameLower.startsWith(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q),
  );
}

export function filterContacts(contacts: Contact[], filters: ContactFilters): Contact[] {
  return contacts.filter((c) => {
    if (filters.role && c.role !== filters.role) return false;
    if (filters.city && c.city !== filters.city) return false;
    return true;
  });
}

/**
 * Blank values are filtered out deliberately: `role` is NOT NULL in the
 * schema but the CSV importer only rejects a *missing* row, not an
 * empty-string role, so an imported contact can legitimately carry `""`.
 * Letting that through would render an empty, unselectable filter option.
 */
export function availableRoles(contacts: Contact[]): string[] {
  return Array.from(new Set(contacts.map((c) => c.role?.trim()).filter((r): r is string => Boolean(r)))).sort();
}

export function availableCities(contacts: Contact[]): string[] {
  return Array.from(new Set(contacts.map((c) => c.city?.trim()).filter((c): c is string => Boolean(c)))).sort();
}

export function groupByLetter(contacts: Contact[]): Array<{ letter: string; contacts: Contact[] }> {
  const sorted = [...contacts].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  const groups = new Map<string, Contact[]>();
  for (const contact of sorted) {
    const letter = (contact.sortKey[0] ?? '#').toUpperCase();
    const bucket = groups.get(letter) ?? [];
    bucket.push(contact);
    groups.set(letter, bucket);
  }
  return Array.from(groups.entries()).map(([letter, contactsInGroup]) => ({ letter, contacts: contactsInGroup }));
}
