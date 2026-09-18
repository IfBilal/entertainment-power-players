import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Track = {
  slug: string;
  name: string;
  order: number;
  active: boolean;
};

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error: loadError } = await supabase.from('tracks').select('*').order('order');
    if (loadError) setError(loadError.message);
    else setTracks(data as Track[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function updateLocal(slug: string, patch: Partial<Track>) {
    setTracks((prev) => prev.map((t) => (t.slug === slug ? { ...t, ...patch } : t)));
  }

  async function save(track: Track) {
    setError(null);
    const { error: saveError } = await supabase
      .from('tracks')
      .update({ name: track.name, order: track.order, active: track.active })
      .eq('slug', track.slug);
    if (saveError) setError(saveError.message);
    else await load();
  }

  async function move(track: Track, direction: -1 | 1) {
    const sorted = [...tracks].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((t) => t.slug === track.slug);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;
    setError(null);
    const [a, b] = [
      supabase.from('tracks').update({ order: swapWith.order }).eq('slug', track.slug),
      supabase.from('tracks').update({ order: track.order }).eq('slug', swapWith.slug),
    ];
    const [resA, resB] = await Promise.all([a, b]);
    if (resA.error || resB.error) setError(resA.error?.message ?? resB.error?.message ?? 'Could not reorder.');
    else await load();
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const slug = slugify(newName);
    const nextOrder = tracks.length > 0 ? Math.max(...tracks.map((t) => t.order)) + 1 : 1;
    const { error: insertError } = await supabase.from('tracks').insert({ slug, name: newName.trim(), order: nextOrder, active: true });
    if (insertError) setError(insertError.message);
    else {
      setCreating(false);
      setNewName('');
      await load();
    }
    setSaving(false);
  }

  const sorted = [...tracks].sort((a, b) => a.order - b.order);

  return (
    <div className="stack">
      <div className="row between">
        <div>
          <h1>Tracks</h1>
          <p className="muted small">The six career-action tracks members work through in Challenges.</p>
        </div>
        <button onClick={() => setCreating((v) => !v)}>+ Add track</button>
      </div>

      {creating ? (
        <form className="card row wrap" onSubmit={handleCreate} style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="new-track">Track name</label>
            <input id="new-track" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          </div>
          <button type="submit" disabled={saving || !newName.trim()}>{saving ? 'Adding…' : 'Add'}</button>
          <button type="button" className="ghost" onClick={() => setCreating(false)}>Cancel</button>
        </form>
      ) : null}

      {error ? <p className="error small">{error}</p> : null}
      {loading ? <p className="muted small">Loading…</p> : null}

      {sorted.map((track, i) => (
        <div key={track.slug} className="card row between">
          <div className="row" style={{ gap: '0.9rem' }}>
            <div className="row" style={{ gap: '0.15rem', flexDirection: 'column' }}>
              <button className="ghost small" style={{ padding: 2 }} onClick={() => move(track, -1)} disabled={i === 0} aria-label="Move up">▲</button>
              <button className="ghost small" style={{ padding: 2 }} onClick={() => move(track, 1)} disabled={i === sorted.length - 1} aria-label="Move down">▼</button>
            </div>
            <div>
              <input
                value={track.name}
                onChange={(e) => updateLocal(track.slug, { name: e.target.value })}
                onBlur={() => save(track)}
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.05rem', border: 'none', padding: '0.2rem 0', width: 220 }}
              />
              <p className="muted small" style={{ margin: 0 }}>{track.slug}</p>
            </div>
            {!track.active ? <span className="badge badge-muted">INACTIVE</span> : null}
          </div>
          <div className="row">
            <button className="ghost small" onClick={() => save({ ...track, active: !track.active })}>
              {track.active ? 'Deactivate' : 'Restore'}
            </button>
            <Link to={`/tracks/${track.slug}`}><button className="secondary small">Manage challenges</button></Link>
          </div>
        </div>
      ))}
    </div>
  );
}
