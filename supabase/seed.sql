-- Real seed content for Entertainment Power Players. Mirrors the source data
-- in docs/challenges-seed.json and docs/contacts-import-template.csv.
-- Safe to re-run (upserts on primary key).

insert into categories (slug, name, icon, "order") values
  ('fashion', 'Fashion', 'glasses-outline', 1),
  ('film-tv', 'Film/TV', 'film-outline', 2),
  ('gaming', 'Gaming', 'game-controller-outline', 3),
  ('music', 'Music', 'musical-notes-outline', 4),
  ('sports', 'Sports', 'trophy-outline', 5)
on conflict (slug) do update set name = excluded.name, icon = excluded.icon, "order" = excluded."order";

insert into quotes (id, text, author, active, "order") values
  ('quote_1', 'Opportunities don''t happen. You create them.', 'Chris Grosser', true, 1),
  ('quote_2', 'The way to get started is to quit talking and begin doing.', 'Walt Disney', true, 2),
  ('quote_3', 'Success is where preparation and opportunity meet.', 'Bobby Unser', true, 3),
  ('quote_4', 'Your network is your net worth.', 'Porter Gale', true, 4),
  ('quote_5', 'Do the best you can until you know better. Then when you know better, do better.', 'Maya Angelou', true, 5)
on conflict (id) do update set text = excluded.text, author = excluded.author, active = excluded.active, "order" = excluded."order";

insert into app_config (id, min_version, paywall_copy, free_tier_rules) values
  (true, '1.0.0', 'Unlock the full directory and every challenge track.', 'Category names, track names, and quotes are free. Contacts and challenges require Pro.')
on conflict (id) do update set min_version = excluded.min_version, paywall_copy = excluded.paywall_copy, free_tier_rules = excluded.free_tier_rules;

insert into tracks (slug, name, "order", active) values
  ('creators-producers', 'Creators + Producers', 1, true),
  ('fashion', 'Fashion', 2, true),
  ('film-tv', 'Film + TV', 3, true),
  ('gaming', 'Gaming', 4, true),
  ('music', 'Music', 5, true),
  ('sports', 'Sports', 6, true)
on conflict (slug) do update set name = excluded.name, "order" = excluded."order", active = excluded.active;

insert into track_challenges (id, track_slug, "order", title, description, type, target) values
  ('creators-producers_1', 'creators-producers', 1, 'Create Something New', 'Make one new idea.', 'single', null),
  ('creators-producers_2', 'creators-producers', 2, 'Treat Yourself', 'Celebrate your wins!', 'single', null),
  ('creators-producers_3', 'creators-producers', 3, 'Find 3 POWER PLAYERS', 'Read trade publications or articles. Who should know your work?', 'counter', 3),
  ('creators-producers_4', 'creators-producers', 4, 'Launch Something', 'Put one idea into motion.', 'single', null),
  ('creators-producers_5', 'creators-producers', 5, 'Make One Introduction', 'Introduce yourself to someone new.', 'single', null),
  ('creators-producers_6', 'creators-producers', 6, 'Make Your NEXT POWER PLAY', 'Choose your next action.', 'single', null),
  ('creators-producers_7', 'creators-producers', 7, 'Name Your IP', 'Give your idea a title.', 'single', null),
  ('creators-producers_8', 'creators-producers', 8, 'Polish Your Bio', 'Write your 50-word bio.', 'single', null),
  ('creators-producers_9', 'creators-producers', 9, 'Protect Your Work', 'Research copyright or trademark.', 'single', null),
  ('creators-producers_10', 'creators-producers', 10, 'Invite the Industry', 'Invite someone to see your work.', 'single', null),

  ('fashion_1', 'fashion', 1, 'Attend 5 Events', 'Go online or in person.', 'counter', 5),
  ('fashion_2', 'fashion', 2, 'Build a Look', 'Create one complete look.', 'single', null),
  ('fashion_3', 'fashion', 3, 'Create Something New', 'Sketch, style or design something.', 'single', null),
  ('fashion_4', 'fashion', 4, 'Find 3 Designers', 'Discover three you should know.', 'counter', 3),
  ('fashion_5', 'fashion', 5, 'Follow a Trend', 'Find tomorrow''s trend.', 'single', null),
  ('fashion_6', 'fashion', 6, 'Meet a POWER PLAYER', 'Make one new connection.', 'single', null),
  ('fashion_7', 'fashion', 7, 'Refresh Your Portfolio', 'Add your strongest work.', 'single', null),
  ('fashion_8', 'fashion', 8, 'Study a Brand', 'Pick one and study it.', 'single', null),
  ('fashion_9', 'fashion', 9, 'Work the Room', 'Start three conversations.', 'counter', 3),
  ('fashion_10', 'fashion', 10, 'Make Your NEXT POWER PLAY', 'Choose your next action.', 'single', null),

  ('film-tv_1', 'film-tv', 1, 'Attend 5 Events', 'Online counts.', 'counter', 5),
  ('film-tv_2', 'film-tv', 2, 'Create Something New', 'Write, shoot or develop something.', 'single', null),
  ('film-tv_3', 'film-tv', 3, 'Find 3 POWER PLAYERS', 'Writers, directors, producers or executives.', 'counter', 3),
  ('film-tv_4', 'film-tv', 4, 'Make an Introduction', 'Reach out to one industry contact.', 'single', null),
  ('film-tv_5', 'film-tv', 5, 'Make Your NEXT POWER PLAY', 'Choose your next action.', 'single', null),
  ('film-tv_6', 'film-tv', 6, 'Polish Your Pitch', 'Make your idea easy to understand.', 'single', null),
  ('film-tv_7', 'film-tv', 7, 'Update Your Bio', 'Tell the industry who you are.', 'single', null),
  ('film-tv_8', 'film-tv', 8, 'Watch a New Genre', 'Study something outside your usual lane.', 'single', null),
  ('film-tv_9', 'film-tv', 9, 'Watch the Credits', 'Study who made the last film you watched.', 'single', null),
  ('film-tv_10', 'film-tv', 10, 'Write a Logline', 'Describe your story in one sentence.', 'single', null),

  ('gaming_1', 'gaming', 1, 'Build a Game Idea', 'Create a title and concept.', 'single', null),
  ('gaming_2', 'gaming', 2, 'Design a Character', 'Give them a name, purpose and backstory.', 'single', null),
  ('gaming_3', 'gaming', 3, 'Find 3 Developers', 'Discover studios you should know.', 'counter', 3),
  ('gaming_4', 'gaming', 4, 'Find 3 POWER PLAYERS', 'Developers, publishers or creators.', 'counter', 3),
  ('gaming_5', 'gaming', 5, 'Join a Gaming Community', 'Start today.', 'single', null),
  ('gaming_6', 'gaming', 6, 'Make Your NEXT POWER PLAY', 'Choose your next action.', 'single', null),
  ('gaming_7', 'gaming', 7, 'Play Something New', 'Try a game outside your usual genre.', 'single', null),
  ('gaming_8', 'gaming', 8, 'Show Your Work', 'Share your game, art or idea.', 'single', null),
  ('gaming_9', 'gaming', 9, 'Study a Platform', 'Console, PC, mobile or cloud.', 'single', null),
  ('gaming_10', 'gaming', 10, 'Study the Market', 'What''s hot right now, next or new?', 'single', null),

  ('music_1', 'music', 1, 'Attend 5 Music Events', 'Online or in person.', 'counter', 5),
  ('music_2', 'music', 2, 'Build a Playlist', 'Choose 10 songs that inspire you.', 'single', null),
  ('music_3', 'music', 3, 'Create Something New', 'Write, produce or record.', 'single', null),
  ('music_4', 'music', 4, 'Find 3 POWER PLAYERS', 'Artists, producers, managers or labels.', 'counter', 3),
  ('music_5', 'music', 5, 'Make an Introduction', 'Connect with one new person.', 'single', null),
  ('music_6', 'music', 6, 'Make Your NEXT POWER PLAY', 'Choose your next action.', 'single', null),
  ('music_7', 'music', 7, 'Name Your Sound', 'Describe your musical lane.', 'single', null),
  ('music_8', 'music', 8, 'Polish One Track', 'Make your strongest song stronger.', 'single', null),
  ('music_9', 'music', 9, 'Share Your Music', 'Put your work where people can hear it.', 'single', null),
  ('music_10', 'music', 10, 'Study a Label', 'Know its artists and sound.', 'single', null),

  ('sports_1', 'sports', 1, 'Attend 5 Sports Events', 'Watch the business, not just the game.', 'counter', 5),
  ('sports_2', 'sports', 2, 'Build Your Brand', 'Write your one-sentence brand statement.', 'single', null),
  ('sports_3', 'sports', 3, 'Create Something New', 'An event, idea, content or business.', 'single', null),
  ('sports_4', 'sports', 4, 'Find 3 POWER PLAYERS', 'Agents, executives, owners or sponsors.', 'counter', 3),
  ('sports_5', 'sports', 5, 'Make Your NEXT POWER PLAY', 'Choose your next action.', 'single', null),
  ('sports_6', 'sports', 6, 'Meet Someone New', 'Make one sports-industry connection.', 'single', null),
  ('sports_7', 'sports', 7, 'Pick Your Lane', 'Athlete, media, business, management or another role.', 'single', null),
  ('sports_8', 'sports', 8, 'Study a Deal', 'Look at an endorsement or sponsorship.', 'single', null),
  ('sports_9', 'sports', 9, 'Study a League', 'Know how it works.', 'single', null),
  ('sports_10', 'sports', 10, 'Update Your Resume', 'Put your best experience first.', 'single', null)
on conflict (id) do update set title = excluded.title, description = excluded.description, type = excluded.type, target = excluded.target;

-- Sample contacts from docs/contacts-import-template.csv, nameLower/sortKey
-- precomputed the same way functions/src/contactFields.ts derives them
-- (lowercase; strip leading "the"/"a"/"an" -- none of these three need it).
insert into contacts (name, name_lower, sort_key, category_slug, role, company, email, phone, website, city, notes, active) values
  ('Jane Doe', 'jane doe', 'jane doe', 'fashion', 'Casting Director', 'Example Casting', 'jane@example.com', '+1 212 555 0101', 'https://example.com', 'New York', 'Accepts submissions by email only', true),
  ('John Smith', 'john smith', 'john smith', 'film-tv', 'Development Executive', 'Example Studios', null, '+1 310 555 0102', 'https://example.com', 'Los Angeles', null, true),
  ('Aisha Khan', 'aisha khan', 'aisha khan', 'music', 'A&R Manager', 'Example Records', 'aisha@example.com', null, null, 'London', null, true)
on conflict do nothing;
