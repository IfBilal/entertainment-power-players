/** Stable, runtime-backed Week 3 records. `order` controls display, never identity. */
export type TrackRecord = {
  slug: string;
  name: string;
  order: number;
  active: boolean;
};

export type ChallengeRecord = {
  id: string;
  trackSlug: string;
  order: number;
  title: string;
  description: string;
  type: 'single' | 'counter';
  target: number | null;
  active: boolean;
};

export type ChallengeProgressRecord = {
  userId: string;
  challengeId: string;
  status: 'not_started' | 'complete';
  count: number;
  completedAt: string | null;
  note: string | null;
};

export type ActivityRecord = {
  id: string;
  userId: string;
  type: 'contact' | 'event' | 'followUp' | 'challenge';
  title: string;
  contactId: string | null;
  challengeId: string | null;
  date: string;
  /** ISO week in the user's local timezone at creation. Never re-derived for history. */
  weekKey: string;
  notes: string | null;
};

export type QuoteRecord = {
  id: string;
  text: string;
  author: string;
  active: boolean;
  order: number;
};

export type QuoteFavoriteRecord = {
  userId: string;
  quoteId: string;
  addedAt: string;
};

export type SubscriptionStatusRecord = {
  userId: string;
  plan: 'monthly' | 'annual' | null;
  productId: string | null;
  platform: 'apple' | 'google' | null;
  state: 'free' | 'trial' | 'active' | 'cancelled' | 'expired';
  activeUntil: string | null;
  willRenew: boolean | null;
  lastReconciledAt: string | null;
};

export const week3QueryKeys = {
  tracks: ['tracks'] as const,
  challenges: (trackSlug: string) => ['challenges', trackSlug] as const,
  progress: (userId: string) => ['challengeProgress', userId] as const,
  activity: (userId: string) => ['activity', userId] as const,
  quotes: ['quotes'] as const,
  quoteFavorites: (userId: string) => ['quoteFavorites', userId] as const,
  subscription: (userId: string) => ['subscription', userId] as const,
};
