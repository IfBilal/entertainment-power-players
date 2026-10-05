import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { canonicalCategoryIcon } from '../lib/categoryIcons';
import { CategoryIconGlyph } from '../lib/iconGlyphs';

type Category = {
  slug: string;
  name: string;
  order: number;
};

const previewCategories: Category[] = [
  { slug: 'fashion', name: 'Fashion', order: 1 },
  { slug: 'film-tv', name: 'Film/TV', order: 2 },
  { slug: 'gaming', name: 'Gaming', order: 3 },
  { slug: 'music', name: 'Music', order: 4 },
  { slug: 'sports', name: 'Sports', order: 5 },
];

export function CategoriesPage({ preview = false }: { preview?: boolean }) {
  const [categories, setCategories] = useState<Category[]>(preview ? previewCategories : []);
  const [loading, setLoading] = useState(!preview);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error: loadError } = await supabase.from('categories').select('slug, name, "order"').order('order');
    if (loadError) setError(loadError.message);
    else setCategories(data as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    if (!preview) void load();
  }, [preview]);

  function updateLocal(slug: string, patch: Partial<Category>) {
    setCategories((prev) => prev.map((c) => (c.slug === slug ? { ...c, ...patch } : c)));
  }

  async function save(category: Category) {
    if (preview) {
      setSavedSlug(category.slug);
      return;
    }
    setSavingSlug(category.slug);
    setError(null);
    setSavedSlug(null);
    const { error: saveError } = await supabase
      .from('categories')
      .update({ name: category.name, order: category.order })
      .eq('slug', category.slug);
    if (saveError) setError(saveError.message);
    else setSavedSlug(category.slug);
    setSavingSlug(null);
  }

  return (
    <div className="stack">
      <div>
        <h1>Categories</h1>
        <p className="muted small">
          Edit names and order. Category icons are fixed to the supervisor-approved set and stay consistent across the app and admin.
        </p>
      </div>

      {error ? <p className="error small">{error}</p> : null}
      {preview ? <p className="muted small">Development preview only — changes are not saved.</p> : null}
      {loading ? <p className="muted small">Loading…</p> : null}

      {categories.map((category) => (
        <div key={category.slug} className="card stack">
          <div className="row between">
            <div className="row" style={{ gap: '0.7rem' }}>
              <span className="pill-icon">
                <CategoryIconGlyph icon={canonicalCategoryIcon(category.slug)} size={17} />
              </span>
              <h2 style={{ margin: 0 }}>{category.name}</h2>
            </div>
            <span className="muted small">{category.slug}</span>
          </div>

          <div className="grid2">
            <div>
              <label htmlFor={`name-${category.slug}`}>Name</label>
              <input
                id={`name-${category.slug}`}
                value={category.name}
                onChange={(e) => updateLocal(category.slug, { name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor={`order-${category.slug}`}>Order</label>
              <input
                id={`order-${category.slug}`}
                type="number"
                value={category.order}
                onChange={(e) => updateLocal(category.slug, { order: Number(e.target.value) })}
              />
            </div>
          </div>

          {canonicalCategoryIcon(category.slug) === 'shapes-outline' ? <p className="error small">This category slug has no approved icon. Review it before publishing.</p> : null}

          <div className="row">
            <button onClick={() => save(category)} disabled={savingSlug === category.slug}>
              {savingSlug === category.slug ? 'Saving…' : 'Save'}
            </button>
            {savedSlug === category.slug ? <span className="success small">Saved</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
