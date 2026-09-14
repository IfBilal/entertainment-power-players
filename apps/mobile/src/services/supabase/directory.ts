import { supabase } from './client';

export type Category = {
  slug: string;
  name: string;
  icon: string;
  order: number;
};

export type Contact = {
  id: string;
  name: string;
  nameLower: string;
  sortKey: string;
  categorySlug: string;
  role: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  notes?: string;
};

type ContactRow = {
  id: string;
  name: string;
  name_lower: string;
  sort_key: string;
  category_slug: string;
  role: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  city: string | null;
  notes: string | null;
};

function toContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    nameLower: row.name_lower,
    sortKey: row.sort_key,
    categorySlug: row.category_slug,
    role: row.role,
    company: row.company ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    city: row.city ?? undefined,
    notes: row.notes ?? undefined,
  };
}

const CONTACT_COLUMNS = 'id, name, name_lower, sort_key, category_slug, role, company, email, phone, website, city, notes';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('slug, name, icon, "order"').order('order');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    slug: row.slug,
    name: row.name,
    icon: row.icon,
    order: row.order,
  }));
}

/**
 * Counts come from a security-definer RPC, not a plain count() on `contacts`:
 * RLS gates contact rows behind `is_pro()`, but the handbook (§4.2) says free
 * users still see the per-category count on the grid. The RPC returns only
 * aggregates, never row data.
 */
export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.rpc('category_contact_counts');
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as Array<{ category_slug: string; contact_count: number }>) {
    counts[row.category_slug] = Number(row.contact_count);
  }
  return counts;
}

/**
 * Under the ~5,000-record threshold the handbook sets, so the whole category
 * loads once and search/filter run in memory (§4.2). Past that this becomes a
 * server-side query and the composite indexes start earning their keep.
 */
export async function fetchContactsByCategory(categorySlug: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select(CONTACT_COLUMNS)
    .eq('category_slug', categorySlug)
    .eq('active', true)
    .order('sort_key');
  if (error) throw error;
  return ((data ?? []) as ContactRow[]).map(toContact);
}

export async function fetchContactById(id: string): Promise<Contact | null> {
  const { data, error } = await supabase.from('contacts').select(CONTACT_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toContact(data as ContactRow) : null;
}

export async function fetchFavoriteContactIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('favorites').select('contact_id').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.contact_id);
}

export async function addFavorite(userId: string, contactId: string) {
  const { error } = await supabase.from('favorites').insert({ user_id: userId, contact_id: contactId });
  if (error) throw error;
}

export async function removeFavorite(userId: string, contactId: string) {
  const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('contact_id', contactId);
  if (error) throw error;
}

/**
 * "Mark as contacted" writes a real activity row (handbook §4.2 / §3) —
 * `week_key` is computed client-side at creation time in the user's own
 * timezone and stored, never derived later by querying date ranges.
 */
export async function logContactedActivity(params: {
  userId: string;
  contactId: string;
  contactName: string;
  weekKey: string;
}) {
  const { error } = await supabase.from('activity').insert({
    user_id: params.userId,
    type: 'contact',
    title: `Marked ${params.contactName} as contacted`,
    contact_id: params.contactId,
    date: new Date().toISOString(),
    week_key: params.weekKey,
  });
  if (error) throw error;
}
