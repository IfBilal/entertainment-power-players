import { computeNameLower, computeSortKey } from '../../utils/contactFields';

export type CategorySlug = 'fashion' | 'film-tv' | 'gaming' | 'music' | 'sports';

export type Contact = {
  id: string;
  name: string;
  nameLower: string;
  sortKey: string;
  categorySlug: CategorySlug;
  role: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  notes?: string;
  active: boolean;
};

/**
 * Local mock fixture shaped exactly like docs/contacts-import-template.csv, so
 * the Directory screens (built on this fixture for Week 1) match the real
 * import format the Cloud Function (Phase 4) will read.
 */
const rawContacts: Array<Omit<Contact, 'id' | 'nameLower' | 'sortKey' | 'active'>> = [
  { name: 'Jane Doe', categorySlug: 'fashion', role: 'Casting Director', company: 'Example Casting', email: 'jane@example.com', phone: '+1 212 555 0101', website: 'https://example.com', city: 'New York', notes: 'Accepts submissions by email only' },
  { name: 'John Smith', categorySlug: 'film-tv', role: 'Development Executive', company: 'Example Studios', phone: '+1 310 555 0102', website: 'https://example.com', city: 'Los Angeles' },
  { name: 'Aisha Khan', categorySlug: 'music', role: 'A&R Manager', company: 'Example Records', email: 'aisha@example.com', city: 'London' },
  { name: 'The Weeknd Management Group', categorySlug: 'music', role: 'Management', company: 'Example Management', email: 'contact@example.com', city: 'Toronto' },
  { name: 'Carlos Rivera', categorySlug: 'sports', role: 'Sports Agent', company: 'Example Agency', phone: '+1 305 555 0110', city: 'Miami' },
  { name: 'Priya Patel', categorySlug: 'gaming', role: 'Studio Producer', company: 'Example Games', email: 'priya@example.com', city: 'Seattle' },
  { name: 'Marcus Lee', categorySlug: 'fashion', role: 'Stylist', company: 'Example Studio', city: 'Los Angeles' },
  { name: 'Zoe Bennett', categorySlug: 'film-tv', role: 'Casting Director', company: 'Example Casting Co', email: 'zoe@example.com', phone: '+1 212 555 0199', city: 'New York' },
];

export const mockContacts: Contact[] = rawContacts.map((contact, index) => ({
  ...contact,
  id: `contact_${index + 1}`,
  nameLower: computeNameLower(contact.name),
  sortKey: computeSortKey(contact.name),
  active: true,
}));

export const mockCategories: Array<{ slug: CategorySlug; name: string; order: number }> = [
  { slug: 'fashion', name: 'Fashion', order: 1 },
  { slug: 'film-tv', name: 'Film/TV', order: 2 },
  { slug: 'gaming', name: 'Gaming', order: 3 },
  { slug: 'music', name: 'Music', order: 4 },
  { slug: 'sports', name: 'Sports', order: 5 },
];

export function contactCountForCategory(slug: CategorySlug): number {
  return mockContacts.filter((c) => c.categorySlug === slug && c.active).length;
}
