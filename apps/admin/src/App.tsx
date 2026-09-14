import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { useAdminAuth } from './lib/useAdminAuth';
import { LoginPage, NoAccessPage } from './pages/LoginPage';
import { ContactsPage } from './pages/ContactsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ImportPage } from './pages/ImportPage';

export default function App() {
  const auth = useAdminAuth();

  if (!isSupabaseConfigured) {
    return (
      <div className="centered">
        <div className="card narrow stack">
          <h1>Not configured</h1>
          <p className="muted">
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (see <code>.env.example</code>)
            and reload.
          </p>
        </div>
      </div>
    );
  }

  if (auth.status === 'loading') {
    return (
      <div className="centered">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (auth.status === 'signedOut') return <LoginPage />;
  if (auth.status === 'notAdmin') return <NoAccessPage email={auth.email} />;

  return (
    <BrowserRouter>
      <div className="shell">
        <nav className="sidebar">
          <div className="brand">Power Players</div>
          <NavLink to="/contacts" className={({ isActive }) => (isActive ? 'active' : '')}>Contacts</NavLink>
          <NavLink to="/import" className={({ isActive }) => (isActive ? 'active' : '')}>Bulk upload</NavLink>
          <NavLink to="/categories" className={({ isActive }) => (isActive ? 'active' : '')}>Categories</NavLink>
          <div className="spacer" />
          <p className="muted small" style={{ margin: 0, wordBreak: 'break-all' }}>{auth.email}</p>
          <button className="ghost small" style={{ alignSelf: 'flex-start' }} onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="*" element={<Navigate to="/contacts" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
