/**
 * Security rules tests against the Firestore emulator (handbook §3, Week 1
 * "Done when": rules written and passing emulator tests).
 *
 * REQUIRES: a JDK installed locally (the emulator won't start without one)
 * and `firebase emulators:start` (or let @firebase/rules-unit-testing spin
 * one up automatically via `npm test` from this directory, which shells out
 * to the Firestore emulator binary under the hood).
 *
 * Not runnable in the environment this was written in (no Java available) —
 * see docs/week1-acceptance.md for what's verified vs. pending.
 *
 * Run: cd firebase && npm install && npm test
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'week1-rules-test',
    firestore: {
      rules: readFileSync(join(__dirname, '../firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

describe('contacts', () => {
  it('denies read to a signed-in free user', async () => {
    const free = testEnv.authenticatedContext('free-user', { pro: false });
    await assertFails(getDoc(doc(free.firestore(), 'contacts/c1')));
  });

  it('denies read to an anonymous user', async () => {
    const anon = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anon.firestore(), 'contacts/c1')));
  });

  it('allows read to a pro user', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'contacts/c1'), { name: 'Jane Doe', active: true });
    });
    const pro = testEnv.authenticatedContext('pro-user', { pro: true });
    await assertSucceeds(getDoc(doc(pro.firestore(), 'contacts/c1')));
  });

  it('denies client writes even from a pro user (admin-only, written by Cloud Function/admin panel)', async () => {
    const pro = testEnv.authenticatedContext('pro-user', { pro: true });
    await assertFails(setDoc(doc(pro.firestore(), 'contacts/c1'), { name: 'x' }));
  });

  it('allows writes from an admin', async () => {
    const admin = testEnv.authenticatedContext('admin-user', { admin: true });
    await assertSucceeds(setDoc(doc(admin.firestore(), 'contacts/c1'), { name: 'Jane Doe', active: true }));
  });
});

describe('categories, tracks, quotes, config', () => {
  it('are readable by any signed-in user, including free users', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'categories/fashion'), { name: 'Fashion' });
      await setDoc(doc(ctx.firestore(), 'quotes/q1'), { text: 'x' });
      await setDoc(doc(ctx.firestore(), 'tracks/fashion'), { name: 'Fashion' });
      await setDoc(doc(ctx.firestore(), 'config/app'), { minVersion: '1.0.0' });
    });
    const free = testEnv.authenticatedContext('free-user', { pro: false });
    await assertSucceeds(getDoc(doc(free.firestore(), 'categories/fashion')));
    await assertSucceeds(getDoc(doc(free.firestore(), 'quotes/q1')));
    await assertSucceeds(getDoc(doc(free.firestore(), 'tracks/fashion')));
    await assertSucceeds(getDoc(doc(free.firestore(), 'config/app')));
  });

  it('denies read to an anonymous (not signed in) user', async () => {
    const anon = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anon.firestore(), 'categories/fashion')));
  });
});

describe('tracks/{id}/challenges subcollection', () => {
  it('requires pro even though the parent track is free to read', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'tracks/fashion/challenges/1'), { title: 'x' });
    });
    const free = testEnv.authenticatedContext('free-user', { pro: false });
    await assertFails(getDoc(doc(free.firestore(), 'tracks/fashion/challenges/1')));

    const pro = testEnv.authenticatedContext('pro-user', { pro: true });
    await assertSucceeds(getDoc(doc(pro.firestore(), 'tracks/fashion/challenges/1')));
  });
});

describe('users/{uid}/**', () => {
  it('lets a user read and write only their own subtree', async () => {
    const owner = testEnv.authenticatedContext('user-1', {});
    await assertSucceeds(setDoc(doc(owner.firestore(), 'users/user-1'), { displayName: 'Jane' }));
    await assertSucceeds(setDoc(doc(owner.firestore(), 'users/user-1/favorites/c1'), { addedAt: 1 }));

    const other = testEnv.authenticatedContext('user-2', {});
    await assertFails(getDoc(doc(other.firestore(), 'users/user-1')));
    await assertFails(setDoc(doc(other.firestore(), 'users/user-1/goals/2026-W37'), { contacts: 5 }));
  });
});

describe('admins collection', () => {
  it('is only readable and writable by admins', async () => {
    const free = testEnv.authenticatedContext('free-user', { pro: false });
    await assertFails(getDoc(doc(free.firestore(), 'admins/free-user')));

    const admin = testEnv.authenticatedContext('admin-user', { admin: true });
    await assertSucceeds(setDoc(doc(admin.firestore(), 'admins/admin-user'), { email: 'a@b.com' }));
  });
});
