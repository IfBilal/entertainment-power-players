import { buildDirectoryItemLayouts } from '../utils/directoryLayout';

describe('A–Z directory layout', () => {
  it('places a distant section header at its real flattened-list offset', () => {
    // SectionList inserts a header and an empty footer around each section.
    const frames = buildDirectoryItemLayouts([2, 1, 2], 72, 26);

    expect(frames).toHaveLength(11);
    expect(frames[0]).toEqual({ index: 0, length: 26, offset: 0 });
    expect(frames[4]).toEqual({ index: 4, length: 26, offset: 170 });
    expect(frames[7]).toEqual({ index: 7, length: 26, offset: 268 });
    expect(frames[8]).toEqual({ index: 8, length: 72, offset: 294 });
    expect(frames[10]).toEqual({ index: 10, length: 0, offset: 438 });
  });
});
