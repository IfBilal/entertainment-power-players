import { tracks as seededTracks } from '../services/mock/challenges';
import type { ChallengeRecord, TrackRecord } from '../types/week3';

/** Test fixtures only; runtime content must come from Supabase. */
export const testTracks: TrackRecord[] = seededTracks.map(({ slug, name, order, active }) => ({
  slug, name, order, active,
}));

export const testChallenges: ChallengeRecord[] = seededTracks.flatMap((track) => (
  track.challenges.map((challenge) => ({
    id: challenge.id,
    trackSlug: track.slug,
    order: challenge.order,
    title: challenge.title,
    description: challenge.description,
    type: challenge.type,
    target: challenge.target ?? null,
    active: true,
  }))
));
