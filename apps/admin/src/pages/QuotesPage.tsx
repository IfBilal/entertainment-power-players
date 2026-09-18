import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

type Quote = {
  id: string;
  text: string;
  author: string;
  active: boolean;
  order: number;
};

const EMPTY_FORM = { text: '', author: '', order: 1, active: true };

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error: loadError } = await supabase.from('quotes').select('*').order('order');
    if (loadError) setError(loadError.message);
    else setQuotes(data as Quote[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    const nextOrder = quotes.length > 0 ? Math.max(...quotes.map((q) => q.order)) + 1 : 1;
    setForm({ ...EMPTY_FORM, order: nextOrder });
    setFormOpen(true);
  }

  function openEdit(quote: Quote) {
    setEditing(quote);
    setForm({ text: quote.text, author: quote.author, order: quote.order, active: quote.active });
    setFormOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      text: form.text.trim(),
      author: form.author.trim(),
      order: form.order,
      active: form.active,
    };

    const res = editing
      ? await supabase.from('quotes').update(payload).eq('id', editing.id)
      : await supabase.from('quotes').insert({ id: `quote_${Date.now()}`, ...payload });

    if (res.error) setError(res.error.message);
    else {
      setFormOpen(false);
      await load();
    }
    setSaving(false);
  }

  async function setActive(quote: Quote, active: boolean) {
    setError(null);
    const { error: updateError } = await supabase.from('quotes').update({ active }).eq('id', quote.id);
    if (updateError) setError(updateError.message);
    else await load();
  }

  return (
    <div className="stack">
      <div className="row between">
        <div>
          <h1>Inspiration</h1>
          <p className="muted small">Manage the quotes shown to members.</p>
        </div>
        <button onClick={openCreate}>+ Add quote</button>
      </div>

      <div className="card stack">
        {error ? <p className="error small">{error}</p> : null}
        {loading ? <p className="muted small">Loading…</p> : null}

        {!loading && quotes.length === 0 ? (
          <div className="empty-state">
            <div className="pill-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 8h1a3 3 0 0 1 0 6H5V9a4 4 0 0 1 4-4M17 8h1a3 3 0 0 1 0 6h-3V9a4 4 0 0 1 4-4" />
              </svg>
            </div>
            <p>No quotes yet.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Quote</th>
                <th>Author</th>
                <th>Order</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className={q.active ? '' : 'inactive'}>
                  <td style={{ maxWidth: 420 }}>&ldquo;{q.text}&rdquo;</td>
                  <td>{q.author}</td>
                  <td>{q.order}</td>
                  <td>
                    <span className={`badge${q.active ? '' : ' badge-muted'}`}>{q.active ? 'ACTIVE' : 'INACTIVE'}</span>
                  </td>
                  <td>
                    <div className="row">
                      <button className="ghost small" onClick={() => openEdit(q)}>Edit</button>
                      {q.active ? (
                        <button className="ghost small" style={{ color: 'var(--danger)' }} onClick={() => setActive(q, false)}>
                          Deactivate
                        </button>
                      ) : (
                        <button className="ghost small" onClick={() => setActive(q, true)}>Restore</button>
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
          <form className="card split-form" onSubmit={handleSave}>
            <div className="stack" style={{ minWidth: 320, flex: 1 }}>
              <h2>{editing ? 'Edit quote' : 'Add quote'}</h2>

              <div>
                <label htmlFor="quote-text">Quote *</label>
                <textarea
                  id="quote-text"
                  rows={4}
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="quote-author">Author *</label>
                <input id="quote-author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
              </div>
              <div className="grid2">
                <div>
                  <label htmlFor="quote-order">Order</label>
                  <input
                    id="quote-order"
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label htmlFor="quote-active">Status</label>
                  <select
                    id="quote-active"
                    value={form.active ? 'active' : 'inactive'}
                    onChange={(e) => setForm({ ...form, active: e.target.value === 'active' })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {error ? <p className="error small">{error}</p> : null}

              <div className="row between">
                <button type="button" className="secondary" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" disabled={saving || !form.text.trim() || !form.author.trim()}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            <div className="quote-preview-pane">
              <p className="muted small" style={{ marginBottom: '0.6rem' }}>LIVE PREVIEW</p>
              <div className="quote-preview-card">
                <span className="quote-preview-mark">&ldquo;</span>
                <p className="quote-preview-text">{form.text || 'Your quote text appears here.'}</p>
                <p className="quote-preview-author">— {form.author || 'Author'}</p>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
