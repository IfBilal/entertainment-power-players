import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Abstract "connections" brand motif for the visual panel -- marching-ants
 * lines + pulsing nodes give the panel real, gentle movement instead of a
 * flat gradient, without looking like a developer architecture diagram.
 */
function ConnectionMotif() {
  const nodes: Array<[number, number, number, number]> = [
    [60, 80, 4, 0],
    [180, 160, 5, 0.8],
    [320, 110, 4, 1.6],
    [140, 300, 5, 0.4],
    [280, 360, 4, 1.2],
    [330, 460, 4, 2],
    [40, 420, 4, 1.8],
  ];
  const lines: Array<[number, number, number, number]> = [
    [60, 80, 180, 160],
    [180, 160, 320, 110],
    [180, 160, 140, 300],
    [140, 300, 280, 360],
    [280, 360, 330, 460],
    [140, 300, 40, 420],
  ];

  return (
    <svg className="auth-orbit-svg" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g className="motif-lines">
        {lines.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      <g className="motif-nodes">
        {nodes.map(([cx, cy, r, delay], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} style={{ animationDelay: `${delay}s` }} />
        ))}
      </g>
    </svg>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) setError(signInError.message);
    setSubmitting(false);
    // On success, useAdminAuth's onAuthStateChange listener re-renders the
    // app into either the panel or the "no access" screen.
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <ConnectionMotif />
        <div className="visual-brand">
          <span className="mark">P</span>
          Power Players
        </div>
        <div className="visual-copy">
          <div className="eyebrow" style={{ color: '#e8b98a' }}>Admin access</div>
          <h2>Where entertainment careers get built.</h2>
          <p>Manage the directory, tracks, and inspiration your members see every day.</p>
        </div>
        <p className="visual-foot">Entertainment Power Players &middot; Internal tool</p>
      </div>

      <div className="auth-panel">
        <form className="auth-card stack" onSubmit={handleSubmit}>
          <div>
            <h1 style={{ fontSize: '1.35rem' }}>Log in</h1>
            <p className="muted small">Sign in to manage the directory</p>
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error ? <p className="error small">{error}</p> : null}

          <button type="submit" disabled={submitting || !email || !password} style={{ width: '100%' }}>
            {submitting ? 'Signing in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}

/** Handbook §5: non-admins get "a plain 'no access' screen". */
export function NoAccessPage({ email }: { email: string | null }) {
  return (
    <div className="centered">
      <div className="auth-card stack">
        <div className="pill-icon" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M4.9 4.9l14.2 14.2" />
          </svg>
        </div>
        <h1 style={{ fontSize: '1.4rem' }}>No access</h1>
        <p className="muted">
          {email ? `${email} isn't an admin account.` : 'This account is not an admin account.'} Contact whoever
          manages the directory if you think that's wrong.
        </p>
        <button className="secondary" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
    </div>
  );
}
