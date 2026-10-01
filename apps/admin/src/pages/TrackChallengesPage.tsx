import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Track = { slug: string; name: string };

type Challenge = {
  id: string;
  track_slug: string;
  order: number;
  title: string;
  description: string;
  type: 'single' | 'counter';
  target: number | null;
  active: boolean;
};

const EMPTY_FORM = { title: '', description: '', type: 'single' as 'single' | 'counter', target: 5 };

export function TrackChallengesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Challenge | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reorderEnabled, setReorderEnabled] = useState(false);

  async function load() {
    if (!slug) return;
    setLoading(true);
    setError(null);
    const [trackRes, challengesRes, configRes] = await Promise.all([
      supabase.from('tracks').select('slug, name').eq('slug', slug).single(),
      supabase.from('track_challenges').select('*').eq('track_slug', slug).order('order'),
      supabase.from('app_config').select('challenge_reorder_enabled').eq('id', true).maybeSingle(),
    ]);
    if (trackRes.error) setError(trackRes.error.message);
    else setTrack(trackRes.data as Track);
    if (challengesRes.error) setError(challengesRes.error.message);
    else setChallenges(challengesRes.data as Challenge[]);
    setReorderEnabled(configRes.data?.challenge_reorder_enabled === true);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFormOpen(true);
  }

  function openEdit(challenge: Challenge) {
    setEditing(challenge);
    setForm({
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      target: challenge.target ?? 5,
    });
    setFormOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!slug) return;

    const configChanged = Boolean(editing && (
      form.type !== editing.type ||
      (form.type === 'counter' ? form.target : null) !== editing.target
    ));
    if (configChanged && !window.confirm(
      'This will recalculate saved progress for every member. Counter counts will be clamped to the new target; completion and its linked Tracker history will be updated together. Continue?',
    )) return;

    setSaving(true);
    setError(null);

    const payload = {
      track_slug: slug,
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      target: form.type === 'counter' ? form.target : null,
    };
    if (!payload.title || (payload.type === 'counter' && (!Number.isInteger(payload.target) || (payload.target ?? 0) < 1))) {
      setError('Enter a title and a positive whole-number counter target.');
      setSaving(false);
      return;
    }

    const res = editing
      ? await supabase.rpc('update_challenge_configuration', {
          p_challenge_id: editing.id,
          p_title: payload.title,
          p_description: payload.description,
          p_type: payload.type,
          p_target: payload.target,
        })
      : await supabase.from('track_challenges').insert({
          id: `${slug}_${Date.now()}`,
          order: challenges.length > 0 ? Math.max(...challenges.map((c) => c.order)) + 1 : 1,
          active: true,
          ...payload,
        });

    if (res.error) setError(res.error.message);
    else {
      setFormOpen(false);
      await load();
    }
    setSaving(false);
  }

  async function setActive(challenge: Challenge, active: boolean) {
    if (!window.confirm(`${active ? 'Restore' : 'Deactivate'} "${challenge.title}"?\n\nMember progress and history will be preserved.`)) {
      return;
    }
    setError(null);
    const { error: updateError } = await supabase.from('track_challenges').update({ active }).eq('id', challenge.id);
    if (updateError) setError(updateError.message);
    else await load();
  }

  async function move(challenge: Challenge, direction: -1 | 1) {
    const sorted = [...challenges].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((c) => c.id === challenge.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;
    if (!reorderEnabled) {
      setError('Challenge reordering is paused until the updated mobile app is in use.');
      return;
    }
    const nextIds = sorted.map((item) => item.id);
    [nextIds[index], nextIds[index + direction]] = [nextIds[index + direction], nextIds[index]];
    setError(null);
    const { error: moveError } = await supabase.rpc('reorder_track_challenges', { p_track_slug: slug, p_challenge_ids: nextIds });
    if (moveError) setError(moveError.message);
    else await load();
  }

  const sorted = [...challenges].sort((a, b) => a.order - b.order);

  return (
    <div className="stack">
      <div>
        <Link to="/tracks" className="small">← Back to tracks</Link>
      </div>
      <div className="row between">
        <div>
          <h1>{track?.name ?? slug}</h1>
          <p className="muted small">{challenges.filter((challenge) => challenge.active).length} active / {challenges.length} total challenges in admin-set order</p>
        </div>
        <button onClick={openCreate}>+ Add challenge</button>
      </div>

      {error ? <p className="error small">{error}</p> : null}
      {!reorderEnabled ? <p className="muted small">Challenge reordering is paused while older app builds are still in use.</p> : null}
      {loading ? <p className="muted small">Loading…</p> : null}

      {!loading && sorted.length === 0 ? (
        <div className="card empty-state">
          <p>No challenges in this track yet.</p>
        </div>
      ) : (
        sorted.map((c, i) => (
          <div key={c.id} className="card row between" style={{ opacity: c.active ? 1 : 0.65 }}>
            <div className="row" style={{ gap: '0.9rem', flex: 1 }}>
              <div className="row" style={{ gap: '0.15rem', flexDirection: 'column' }}>
                <button className="ghost small" style={{ padding: 2 }} onClick={() => move(c, -1)} disabled={!reorderEnabled || i === 0} aria-label="Move up">▲</button>
                <button className="ghost small" style={{ padding: 2 }} onClick={() => move(c, 1)} disabled={!reorderEnabled || i === sorted.length - 1} aria-label="Move down">▼</button>
              </div>
              <div style={{ flex: 1 }}>
                <div className="row" style={{ gap: '0.5rem' }}>
                  <strong>{c.title}</strong>
                  <span className="badge">{c.type === 'counter' ? `COUNTER · TARGET ${c.target}` : 'SINGLE'}</span>
                  {!c.active ? <span className="badge badge-muted">INACTIVE</span> : null}
                </div>
                {c.description ? <p className="muted small" style={{ margin: '0.2rem 0 0' }}>{c.description}</p> : null}
              </div>
            </div>
            <div className="row">
              <button className="ghost small" onClick={() => openEdit(c)}>Edit</button>
              <button className="ghost small" style={{ color: c.active ? 'var(--danger)' : undefined }} onClick={() => setActive(c, !c.active)}>{c.active ? 'Deactivate' : 'Restore'}</button>
            </div>
          </div>
        ))
      )}

      {formOpen ? (
        <div className="centered" style={{ position: 'fixed', inset: 0, background: 'rgba(34,27,20,0.45)', zIndex: 10 }}>
          <form className="card stack" style={{ maxWidth: 520, width: '92%' }} onSubmit={handleSave}>
            <h2>{editing ? 'Edit challenge' : 'Add challenge'}</h2>

            <div>
              <label htmlFor="c-title">Title *</label>
              <input id="c-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="c-description">Description</label>
              <textarea id="c-description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label htmlFor="c-type">Type</label>
              <select id="c-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'single' | 'counter' })}>
                <option value="single">Single</option>
                <option value="counter">Counter</option>
              </select>
            </div>
            {form.type === 'counter' ? (
              <div>
                <label htmlFor="c-target">Target</label>
                <input
                  id="c-target"
                  type="number"
                  min={1}
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: Number(e.target.value) })}
                />
              </div>
            ) : null}
            {editing && (form.type !== editing.type || (form.type === 'counter' ? form.target : null) !== editing.target) ? (
              <p className="muted small">Saving recalculates existing progress: counter counts are clamped to the target, and completion plus linked Tracker history are updated together.</p>
            ) : null}

            {error ? <p className="error small">{error}</p> : null}

            <div className="row between">
              <button type="button" className="secondary" onClick={() => setFormOpen(false)}>Cancel</button>
              <button type="submit" disabled={saving || !form.title.trim()}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
