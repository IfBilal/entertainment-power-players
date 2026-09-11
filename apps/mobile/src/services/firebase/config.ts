/**
 * Firebase web config, read from env at build time. Values are placeholders until
 * a real Firebase project exists (see root README "Firebase project setup").
 * No client code should import `initializeApp` results until Week 2+ wires up
 * live reads/writes — Week 1 screens run entirely on local mock data.
 */
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
} as const;

export const isFirebaseConfigured = Object.values(firebaseConfig).every((value) => value.length > 0);
