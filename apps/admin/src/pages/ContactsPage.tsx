import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { computeNameLower, computeSortKey } from '../lib/contactFields';

type Contact = {
  id: string;
  name: string;
  category_slug: string;
  role: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  city: string | null;
  notes: string | null;
  active: boolean;
};

type Category = { slug: string; name: string };

const EMPTY_FORM = {
  name: '',
  category_slug: '',
  role: '',
  company: '',
  email: '',
  phone: '',
  website: '',
  city: '',
  notes: '',
};

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const [contactsRes, categoriesRes] = await Promise.all([
      supabase.from('contacts').select('*').order('sort_key'),
      supabase.from('categories').select('slug, name').order('order'),
    ]);
    if (contactsRes.error) setError(contactsRes.error.message);
    else setContacts(contactsRes.data as Contact[]);
    if (!categoriesRes.error) setCategories(categoriesRes.data as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts
      .filter((c) => (showInactive ? true : c.active))
      .filter((c) =>
        !q
          ? true
          : c.name.toLowerCase().includes(q) ||
            (c.company ?? '').toLowerCase().includes(q) ||
            c.role.toLowerCase().includes(q) ||
            (c.city ?? '').toLowerCase().includes(q),
      );
  }, [contacts, search, showInactive]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category_slug: categories[0]?.slug ?? '' });
    setFormOpen(true);
  }

  function openEdit(contact: Contact) {
    setEditing(contact);
    setForm({
      name: contact.name,
      category_slug: contact.category_slug,
      role: contact.role,
      company: contact.company ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      website: contact.website ?? '',
      city: contact.city ?? '',
      notes: contact.notes ?? '',
    });
    setFormOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // nameLower/sortKey are always derived here, never typed by hand
    // (handbook §3: written by the admin panel and the import function).
    const payload = {
      name: form.name.trim(),
      name_lower: computeNameLower(form.name),
      sort_key: computeSortKey(form.name),
      category_slug: form.category_slug,
      role: form.role.trim(),
      company: form.company.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      website: form.website.trim() || null,
      city: form.city.trim() || null,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const res = editing
      ? await supabase.from('contacts').update(payload).eq('id', editing.id)
      : await supabase.from('contacts').insert({ ...payload, active: true });

    if (res.error) setError(res.error.message);
    else {
      setFormOpen(false);
      await load();
    }
    setSaving(false);
  }

  /** Deletes are soft — set active:false, never remove the row (handbook §3). */
  async function setActive(contact: Contact, active: boolean) {
    setError(null);
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', contact.id);
    if (updateError) setError(updateError.message);
    else await load();
  }

  return (
    <div className="stack">
      <div className="row between">
        <div>
          <h1>Contacts</h1>
          <p className="muted small">The directory your subscribers browse in the app</p>
        </div>
        <button onClick={openCreate}>+ Add contact</button>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="num">{contacts.filter((c) => c.active).length}</div>
          <div className="label">Active</div>
        </div>
        <div className="stat">
          <div className="num">{categories.length}</div>
          <div className="label">Categories</div>
        </div>
        <div className="stat">
          <div className="num">{contacts.filter((c) => !c.active).length}</div>
          <div className="label">Inactive</div>
        </div>
      </div>

      <div className="card stack">
        <div className="row wrap">
          <input
            placeholder="Search name, company, role or city"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          <label className="row small" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              style={{ width: 'auto', marginRight: 6 }}
            />
            Show inactive
          </label>
        </div>

        {error ? <p className="error small">{error}</p> : null}
        {loading ? <p className="muted small">Loading…</p> : null}

        {!loading && visible.length === 0 ? (
          <div className="empty-state">
            <div className="pill-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </div>
            <p>No contacts match your search.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Role</th>
                <th>Company</th>
                <th>City</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} className={c.active ? '' : 'inactive'}>
                  <td>
                    <div className="row" style={{ gap: '0.6rem' }}>
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: 'var(--accent-soft)',
                          color: 'var(--accent-deep)',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                      <span>
                        {c.name} {c.active ? null : <span className="badge">INACTIVE</span>}
                      </span>
                    </div>
                  </td>
                  <td>{categories.find((cat) => cat.slug === c.category_slug)?.name ?? c.category_slug}</td>
                  <td>{c.role}</td>
                  <td>{c.company ?? '—'}</td>
                  <td>{c.city ?? '—'}</td>
                  <td>
                    <div className="row">
                      <button className="ghost small" onClick={() => openEdit(c)}>Edit</button>
                      {c.active ? (
                        <button
                          className="ghost small"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => {
                            if (window.confirm(`Deactivate ${c.name}?\n\nThe contact will disappear from the app but can be restored later.`)) {
                              setActive(c, false);
                            }
                          }}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button className="ghost small" onClick={() => setActive(c, true)}>Restore</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formOpen ? (
        <div className="centered" style={{ position: 'fixed', inset: 0, background: 'rgba(34,27,20,0.45)', zIndex: 10 }}>
          <form className="card stack" style={{ maxWidth: 560, width: '92%' }} onSubmit={handleSave}>
            <h2>{editing ? 'Edit contact' : 'Add contact'}</h2>

            <div className="grid2">
              <div>
                <label htmlFor="name">Name *</label>
                <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={form.category_slug}
                  onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="role">Role</label>
                <input id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
              <div>
                <label htmlFor="company">Company</label>
                <input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label htmlFor="phone">Phone</label>
                <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label htmlFor="website">Website</label>
                <input id="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <div>
                <label htmlFor="city">City</label>
                <input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>

            <div>
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <p className="muted small">
              Sort key and search key are generated automatically from the name.
            </p>

            {error ? <p className="error small">{error}</p> : null}

            <div className="row between">
              <button type="button" className="secondary" onClick={() => setFormOpen(false)}>Cancel</button>
              <button type="submit" disabled={saving || !form.name || !form.category_slug}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
