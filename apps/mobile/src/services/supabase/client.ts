import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';

/**
 * SecureStore-backed storage adapter for Supabase session persistence —
 * the standard Expo + Supabase pattern (AsyncStorage would work too, but
 * SecureStore keeps tokens in the OS keychain/keystore rather than plain
 * on-device storage).
 */
const secureStoreAdapter: SupportedStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const configuredAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = configuredUrl.length > 0 && configuredAnonKey.length > 0;

/**
 * `createClient` throws on an empty/invalid URL, which would crash the app at
 * import time if `.env` is missing or misconfigured (and breaks unit tests,
 * which have no env). Fall back to a syntactically valid placeholder so the
 * module always imports; `isSupabaseConfigured` is the real signal, and any
 * request made against the placeholder simply fails at call time instead of
 * taking the whole app down on startup.
 */
const supabaseUrl = isSupabaseConfigured ? configuredUrl : 'http://localhost:54321';
const supabaseAnonKey = isSupabaseConfigured ? configuredAnonKey : 'public-anon-key-placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
