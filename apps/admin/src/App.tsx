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
        <div className="auth-card stack">
          <h1 style={{ fontSize: '1.4rem' }}>Not configured</h1>
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
        <div className="auth-wordmark" style={{ opacity: 0.6 }}>
          <span className="mark">P</span>
          <h1 style={{ fontSize: '1.4rem' }}>Power Players</h1>
        </div>
      </div>
    );
  }

  if (auth.status === 'signedOut') return <LoginPage />;
  if (auth.status === 'notAdmin') return <NoAccessPage email={auth.email} />;

  return (
    <BrowserRouter>
      <div className="shell">
        <nav className="sidebar">
          <div className="brand">
            <span className="mark">P</span>
            Power Players
          </div>
          <NavLink to="/contacts" className={({ isActive }) => (isActive ? 'active' : '')}>
            <ContactsIcon />
            Contacts
          </NavLink>
          <NavLink to="/import" className={({ isActive }) => (isActive ? 'active' : '')}>
            <UploadIcon />
            Bulk upload
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => (isActive ? 'active' : '')}>
            <CategoriesIcon />
            Categories
          </NavLink>
          <div className="spacer" />
          <div className="account stack" style={{ gap: '0.5rem' }}>
            <p className="muted small" style={{ margin: 0, wordBreak: 'break-all' }}>{auth.email}</p>
            <button className="ghost small" style={{ alignSelf: 'flex-start' }} onClick={() => supabase.auth.signOut()}>
              Sign out
            </button>
          </div>
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

/** Inline so the sidebar has no icon-library dependency for three glyphs. */
function ContactsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
