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
      <form className="card narrow stack" onSubmit={handleSubmit}>
        <div>
          <h1>Power Players</h1>
          <p className="muted small">Admin panel</p>
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

        <button type="submit" disabled={submitting || !email || !password}>
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
      <div className="card narrow stack">
        <h1>No access</h1>
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
