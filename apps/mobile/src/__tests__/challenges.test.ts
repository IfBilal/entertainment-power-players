import { applyChallengeAction, trackCompletionCount, type Challenge, type ChallengeProgressMap, type Track } from '../services/mock/challenges';

const single: Challenge = { order: 1, title: 'Create Something New', description: '', type: 'single' };
const counter: Challenge = { order: 2, title: 'Find 3 Power Players', description: '', type: 'counter', target: 3 };

describe('applyChallengeAction', () => {
  it('toggles a single challenge complete then back to not started', () => {
    const step1 = applyChallengeAction(single, undefined, 'toggle');
    expect(step1).toEqual({ status: 'complete', count: 1 });
    const step2 = applyChallengeAction(single, step1, 'toggle');
    expect(step2).toEqual({ status: 'not_started', count: 0 });
  });

  it('increments a counter challenge and completes exactly at target, not past it', () => {
    let progress = applyChallengeAction(counter, undefined, 'increment');
    expect(progress).toEqual({ status: 'not_started', count: 1 });
    progress = applyChallengeAction(counter, progress, 'increment');
    expect(progress).toEqual({ status: 'not_started', count: 2 });
    progress = applyChallengeAction(counter, progress, 'increment');
    expect(progress).toEqual({ status: 'complete', count: 3 });
    // Stops at target — does not overshoot.
    progress = applyChallengeAction(counter, progress, 'increment');
    expect(progress.count).toBe(3);
  });

  it('allows decrementing a counter challenge back below target, reopening it', () => {
    let progress = applyChallengeAction(counter, { status: 'complete', count: 3 }, 'decrement');
    expect(progress).toEqual({ status: 'not_started', count: 2 });
  });

  it('does not let a counter challenge go below zero', () => {
    const progress = applyChallengeAction(counter, { status: 'not_started', count: 0 }, 'decrement');
    expect(progress.count).toBe(0);
  });
});

describe('trackCompletionCount', () => {
  it('counts only completed challenges for this track', () => {
    const track: Track = { slug: 'fashion', name: 'Fashion', order: 1, active: true, challenges: [single, counter] };
    const progress: ChallengeProgressMap = {
      fashion_1: { status: 'complete', count: 1 },
      fashion_2: { status: 'not_started', count: 1 },
    };
    expect(trackCompletionCount(track, progress)).toEqual({ done: 1, total: 2 });
  });
});
