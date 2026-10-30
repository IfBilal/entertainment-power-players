import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Question = {
  id: string;
  category_slug: string;
  challenge_group: string;
  number: number;
  question: string;
  answer: string;
  why: string;
  power_move: string;
  active: boolean;
};

type Category = { slug: string; name: string };

const EMPTY_FORM = {
  category_slug: '',
  challenge_group: '',
  number: 1,
  question: '',
  answer: '',
  why: '',
  power_move: '',
  active: true,
};

export function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const [qs, cats] = await Promise.all([
      supabase.from('questions').select('*').order('category_slug').order('challenge_group').order('number'),
      supabase.from('categories').select('slug, name'),
    ]);
    if (qs.error) setError(qs.error.message);
    else setQuestions(qs.data as Question[]);
    if (!cats.error) setCategories(cats.data as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category_slug: categories[0]?.slug ?? '' });
    setFormOpen(true);
  }

  function openEdit(question: Question) {
    setEditing(question);
    setForm({
      category_slug: question.category_slug,
      challenge_group: question.challenge_group,
      number: question.number,
      question: question.question,
      answer: question.answer,
      why: question.why,
      power_move: question.power_move,
      active: question.active,
    });
    setFormOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      category_slug: form.category_slug,
      challenge_group: form.challenge_group.trim(),
      number: form.number,
      question: form.question.trim(),
      answer: form.answer.trim(),
      why: form.why.trim(),
      power_move: form.power_move.trim(),
      active: form.active,
    };

    const res = editing
      ? await supabase.from('questions').update(payload).eq('id', editing.id)
      : await supabase.from('questions').insert(payload);

    if (res.error) setError(res.error.message);
    else {
      setFormOpen(false);
      await load();
    }
    setSaving(false);
  }

  async function setActive(question: Question, active: boolean) {
    setError(null);
    const { error: updateError } = await supabase.from('questions').update({ active }).eq('id', question.id);
    if (updateError) setError(updateError.message);
    else await load();
  }

  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const visible = questions.filter((q) => (showInactive ? true : q.active));

  return (
    <div className="stack">
      <div className="row between">
        <div>
          <h1>Power Moves</h1>
          <p className="muted small">Manage individual questions. Each needs a question, answer, why, and power move.</p>
        </div>
        <div className="row" style={{ gap: '0.5rem' }}>
          <label className="row small inactive-toggle" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
            Show inactive
          </label>
          <Link className="button-link" to="/questions-import">Import CSV</Link>
          <button onClick={openCreate} disabled={categories.length === 0}>+ Add question</button>
        </div>
      </div>

      <div className="card stack">
        {error ? <p className="error small">{error}</p> : null}
        {loading ? <p className="muted small">Loading…</p> : null}

        {!loading && visible.length === 0 ? (
          <div className="empty-state">
            <div className="pill-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
            </div>
            <p>No questions yet.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Group</th>
                <th>#</th>
                <th>Question</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((q) => (
                <tr key={q.id} className={q.active ? '' : 'inactive'}>
                  <td>{categoryName(q.category_slug)}</td>
                  <td>{q.challenge_group}</td>
                  <td>{q.number}</td>
                  <td style={{ maxWidth: 360 }}>{q.question}</td>
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
        <div className="centered" style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 10 }}>
          <form className="card stack" style={{ minWidth: 320, maxWidth: 560, width: '92%' }} onSubmit={handleSave}>
            <h2>{editing ? 'Edit question' : 'Add question'}</h2>

            <div className="grid2">
              <div>
                <label htmlFor="q-category">Category *</label>
                <select
                  id="q-category"
                  value={form.category_slug}
                  onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="q-group">Challenge group *</label>
                <input
                  id="q-group"
                  value={form.challenge_group}
                  onChange={(e) => setForm({ ...form, challenge_group: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid2">
              <div>
                <label htmlFor="q-number">Number *</label>
                <input
                  id="q-number"
                  type="number"
                  min={1}
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label htmlFor="q-active">Status</label>
                <select
                  id="q-active"
                  value={form.active ? 'active' : 'inactive'}
                  onChange={(e) => setForm({ ...form, active: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="q-question">Question *</label>
              <textarea
                id="q-question"
                rows={2}
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="q-answer">Answer *</label>
              <textarea
                id="q-answer"
                rows={2}
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="q-why">Why *</label>
              <textarea
                id="q-why"
                rows={2}
                value={form.why}
                onChange={(e) => setForm({ ...form, why: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="q-power-move">Power move *</label>
              <textarea
                id="q-power-move"
                rows={2}
                value={form.power_move}
                onChange={(e) => setForm({ ...form, power_move: e.target.value })}
                required
              />
            </div>

            {error ? <p className="error small">{error}</p> : null}

            <div className="row between">
              <button type="button" className="secondary" onClick={() => setFormOpen(false)}>Cancel</button>
              <button
                type="submit"
                disabled={
                  saving ||
                  !form.category_slug ||
                  !form.challenge_group.trim() ||
                  !form.question.trim() ||
                  !form.answer.trim() ||
                  !form.why.trim() ||
                  !form.power_move.trim()
                }
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
