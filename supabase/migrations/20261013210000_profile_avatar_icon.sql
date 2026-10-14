-- Lets a user pick a characterized profile icon (a bundled vector glyph,
-- e.g. "panda" or "robot-happy-outline") instead of plain initials. Null
-- means no icon chosen yet, and the client falls back to initials. This is
-- separate from photo_url, which stays unused per the no-real-people policy.
alter table profiles add column avatar_icon text;
