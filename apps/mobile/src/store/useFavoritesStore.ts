import { create } from 'zustand';

type FavoritesState = {
  favoriteContactIds: Set<string>;
  favoriteQuoteIds: Set<string>;
  toggleContact: (id: string) => void;
  toggleQuote: (id: string) => void;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteContactIds: new Set(),
  favoriteQuoteIds: new Set(),
  toggleContact: (id) => {
    const next = new Set(get().favoriteContactIds);
    next.has(id) ? next.delete(id) : next.add(id);
    set({ favoriteContactIds: next });
  },
  toggleQuote: (id) => {
    const next = new Set(get().favoriteQuoteIds);
    next.has(id) ? next.delete(id) : next.add(id);
    set({ favoriteQuoteIds: next });
  },
}));
