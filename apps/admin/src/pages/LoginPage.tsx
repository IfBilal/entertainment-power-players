import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

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
    <div className="centered">
      <form className="auth-card stack" onSubmit={handleSubmit}>
        <div>
          <div className="eyebrow">Admin access</div>
          <div className="auth-wordmark">
            <span className="mark">P</span>
            <h1>Power Players</h1>
          </div>
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
