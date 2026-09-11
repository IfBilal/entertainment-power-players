import { isScreenLocked } from '../utils/paywall';

describe('isScreenLocked', () => {
  it('locks directory contact list and challenge track detail for free users', () => {
    expect(isScreenLocked('directoryContactList', false)).toBe(true);
    expect(isScreenLocked('challengeTrackDetail', false)).toBe(true);
  });

  it('leaves category names, track names and quotes free (handbook §1)', () => {
    expect(isScreenLocked('categoryGrid', false)).toBe(false);
    expect(isScreenLocked('trackList', false)).toBe(false);
    expect(isScreenLocked('inspiration', false)).toBe(false);
  });

  it('unlocks everything for pro users', () => {
    expect(isScreenLocked('directoryContactList', true)).toBe(false);
    expect(isScreenLocked('challengeTrackDetail', true)).toBe(false);
  });
});
