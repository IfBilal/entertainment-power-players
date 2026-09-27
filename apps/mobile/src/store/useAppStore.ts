import { create } from 'zustand';

/** Current account's effective premium access, hydrated from Supabase. */
type AppState = {
  isPro: boolean;
  setIsPro: (value: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  isPro: false,
  setIsPro: (value) => set({ isPro: value }),
}));
