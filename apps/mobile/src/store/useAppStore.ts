import { create } from 'zustand';

/**
 * Mock entitlement state. In production this is decided server-side by a
 * `profile_entitlements.is_pro` row set from the RevenueCat webhook
 * (handbook §2) — `isPro` here is a local stand-in so the paywall gate can be
 * built and tested before RevenueCat is wired up in Week 3.
 */
type AppState = {
  isPro: boolean;
  setIsPro: (value: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  isPro: false,
  setIsPro: (value) => set({ isPro: value }),
}));
