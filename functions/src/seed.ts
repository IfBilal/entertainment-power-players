/**
 * One-off seed script: loads the real seed content (docs/challenges-seed.json)
 * and a starter set of categories/quotes into Firestore, matching the
 * handbook §3 data model. Run with: npm run seed (see functions/package.json).
 * Safe to re-run — uses deterministic doc ids (slugs), so it overwrites
 * rather than duplicating.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const categories = [
  { slug: 'fashion', name: 'Fashion', icon: 'glasses-outline', order: 1 },
  { slug: 'film-tv', name: 'Film/TV', icon: 'film-outline', order: 2 },
  { slug: 'gaming', name: 'Gaming', icon: 'game-controller-outline', order: 3 },
  { slug: 'music', name: 'Music', icon: 'musical-notes-outline', order: 4 },
  { slug: 'sports', name: 'Sports', icon: 'trophy-outline', order: 5 },
];

const quotes = [
  { id: 'quote_1', text: 'Opportunities don’t happen. You create them.', author: 'Chris Grosser', active: true, order: 1 },
  { id: 'quote_2', text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney', active: true, order: 2 },
  { id: 'quote_3', text: 'Success is where preparation and opportunity meet.', author: 'Bobby Unser', active: true, order: 3 },
  { id: 'quote_4', text: 'Your network is your net worth.', author: 'Porter Gale', active: true, order: 4 },
  { id: 'quote_5', text: 'Do the best you can until you know better. Then when you know better, do better.', author: 'Maya Angelou', active: true, order: 5 },
];

type SeedChallenge = { order: number; title: string; description: string; type: 'single' | 'counter'; target?: number };
type SeedTrack = { slug: string; name: string; order: number; active: boolean; challenges: SeedChallenge[] };

async function main() {
  const batch = db.batch();

  for (const category of categories) {
    batch.set(db.collection('categories').doc(category.slug), category);
  }
  for (const quote of quotes) {
    const { id, ...rest } = quote;
    batch.set(db.collection('quotes').doc(id), rest);
  }
  batch.set(db.collection('config').doc('app'), {
    minVersion: '1.0.0',
    paywallCopy: 'Unlock the full directory and every challenge track.',
    freeTierRules: 'Category names, track names, and quotes are free. Contacts and challenges require Pro.',
  });

  await batch.commit();
  console.log(`Seeded ${categories.length} categories, ${quotes.length} quotes, 1 config doc.`);

  const seedPath = join(__dirname, '../../docs/challenges-seed.json');
  const { tracks } = JSON.parse(readFileSync(seedPath, 'utf8')) as { tracks: SeedTrack[] };

  for (const track of tracks) {
    const trackRef = db.collection('tracks').doc(track.slug);
    const trackBatch = db.batch();
    trackBatch.set(trackRef, { name: track.name, slug: track.slug, order: track.order, active: track.active });
    for (const challenge of track.challenges) {
      trackBatch.set(trackRef.collection('challenges').doc(String(challenge.order)), challenge);
    }
    await trackBatch.commit();
    console.log(`Seeded track "${track.name}" with ${track.challenges.length} challenges.`);
  }

  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
