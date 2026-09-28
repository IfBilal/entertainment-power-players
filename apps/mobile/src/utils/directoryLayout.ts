export type DirectoryItemLayout = { index: number; length: number; offset: number };

export function buildDirectoryItemLayouts(
  sectionItemCounts: readonly number[],
  rowHeight: number,
  headerHeight: number,
): DirectoryItemLayout[] {
  const layouts: DirectoryItemLayout[] = [];
  let offset = 0;
  function append(length: number) {
    layouts.push({ index: layouts.length, length, offset });
    offset += length;
  }

  for (const count of sectionItemCounts) {
    append(headerHeight);
    for (let index = 0; index < count; index += 1) append(rowHeight);
    append(0);
  }

  return layouts;
}
