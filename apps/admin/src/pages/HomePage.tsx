import { Link } from 'react-router-dom';

const shortcuts = [
  { to: '/contacts', title: 'Contacts', description: 'Search, add, edit and soft-delete directory contacts.' },
  { to: '/import', title: 'Bulk upload', description: 'Import contacts from a CSV, with per-row validation.' },
  { to: '/categories', title: 'Categories', description: 'Names, order and icons for the five directory categories.' },
  { to: '/quotes', title: 'Quotes', description: 'The quotes shown in Inspiration, with a live preview.' },
  { to: '/tracks', title: 'Tracks', description: 'The six challenge tracks and the challenges inside each.' },
];

/**
 * No dashboard metrics here on purpose (handbook §5: "No reporting, no
 * analytics, no subscriber numbers" — those live in Supabase/RevenueCat, not
 * here). This is a content-management landing, not a stats page.
 */
export function HomePage() {
  return (
    <div className="stack">
      <div>
        <h1>Content management</h1>
        <p className="muted small">Keep the experience current.</p>
      </div>

      <div className="home-grid">
        {shortcuts.map((s) => (
          <Link key={s.to} to={s.to} className="home-card">
            <h2 style={{ margin: 0 }}>{s.title}</h2>
            <p className="muted small" style={{ margin: '0.35rem 0 0' }}>{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
