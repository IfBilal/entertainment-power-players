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

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

/**
 * Not yet used by any screen — Week 1 screens run entirely on local mock
 * data (src/services/mock/*). Wiring real reads/writes into the screens is
 * Week 2 (Auth + Directory) / Week 3 (Tracker, Challenges, Inspiration)
 * scope. This client is ready for that work.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
