/**
 * ISO week key in the user's own (local) timezone, format `2026-W37`
 * (handbook §3). Computed once at activity-creation time and stored — never
 * re-derived by querying date ranges. Uses local getFullYear/getMonth/getDate
 * (not UTC) so a local-midnight rollover always lands in the correct week,
 * per the QA checklist item in §7.
 */
export function computeWeekKey(date: Date): string {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // ISO week: Thursday of this week determines the ISO year.
  const dayNum = (local.getDay() + 6) % 7; // Mon=0 .. Sun=6
  const thursday = new Date(local);
  thursday.setDate(local.getDate() - dayNum + 3);

  const isoYear = thursday.getFullYear();
  const jan1 = new Date(isoYear, 0, 1);
  const week = Math.ceil(((thursday.getTime() - jan1.getTime()) / 86400000 + 1) / 7);

  return `${isoYear}-W${String(week).padStart(2, '0')}`;
}
