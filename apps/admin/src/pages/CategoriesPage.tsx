import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CATEGORY_ICON_OPTIONS } from '../lib/categoryIcons';
import { CategoryIconGlyph } from '../lib/iconGlyphs';

type Category = {
  slug: string;
  name: string;
  icon: string;
  order: number;
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error: loadError } = await supabase.from('categories').select('slug, name, icon, "order"').order('order');
    if (loadError) setError(loadError.message);
    else setCategories(data as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function updateLocal(slug: string, patch: Partial<Category>) {
    setCategories((prev) => prev.map((c) => (c.slug === slug ? { ...c, ...patch } : c)));
  }

  async function save(category: Category) {
    setSavingSlug(category.slug);
    setError(null);
    setSavedSlug(null);
    const { error: saveError } = await supabase
      .from('categories')
      .update({ name: category.name, icon: category.icon, order: category.order })
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
          Name, order and icon. Changes appear in the app immediately — no app update needed.
        </p>
      </div>

      {error ? <p className="error small">{error}</p> : null}
      {loading ? <p className="muted small">Loading…</p> : null}

      {categories.map((category) => (
        <div key={category.slug} className="card stack">
          <div className="row between">
            <div className="row" style={{ gap: '0.7rem' }}>
              <span className="pill-icon">
                <CategoryIconGlyph icon={category.icon} size={17} />
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

          <div>
            <label>Icon</label>
            <div className="icon-grid">
              {CATEGORY_ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-swatch${category.icon === icon ? ' selected' : ''}`}
                  onClick={() => updateLocal(category.slug, { icon })}
                  title={icon}
                  aria-pressed={category.icon === icon}
                >
                  <CategoryIconGlyph icon={icon} size={20} />
                </button>
              ))}
            </div>
          </div>

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
