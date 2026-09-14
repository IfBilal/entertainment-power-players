import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CATEGORY_ICON_OPTIONS } from '../lib/categoryIcons';

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
            <h2>{category.name}</h2>
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
            <label htmlFor={`icon-${category.slug}`}>Icon</label>
            <select
              id={`icon-${category.slug}`}
              value={category.icon}
              onChange={(e) => updateLocal(category.slug, { icon: e.target.value })}
            >
              {/* Keep whatever is stored selectable even if it predates this list. */}
              {!CATEGORY_ICON_OPTIONS.includes(category.icon as never) ? (
                <option value={category.icon}>{category.icon} (current)</option>
              ) : null}
              {CATEGORY_ICON_OPTIONS.map((icon) => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
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
