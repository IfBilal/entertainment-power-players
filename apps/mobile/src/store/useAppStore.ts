import { create } from 'zustand';

/**
 * Mock entitlement + onboarding state for Week 1. In production this is decided
 * server-side by a Firestore custom claim set from the RevenueCat webhook
 * (handbook §2) — `isPro` here is a local stand-in so the paywall gate can be
 * built and tested before RevenueCat is wired up in Week 3.
 */
type AppState = {
  isPro: boolean;
  hasOnboarded: boolean;
  selectedTrackSlugs: string[];
  setIsPro: (value: boolean) => void;
  completeOnboarding: (selectedTracks: string[]) => void;
  setSelectedTracks: (slugs: string[]) => void;
};

export const useAppStore = create<AppState>((set) => ({
  isPro: false,
  hasOnboarded: false,
  selectedTrackSlugs: [],
  setIsPro: (value) => set({ isPro: value }),
  completeOnboarding: (selectedTracks) => set({ hasOnboarded: true, selectedTrackSlugs: selectedTracks }),
  setSelectedTracks: (slugs) => set({ selectedTrackSlugs: slugs }),
}));
