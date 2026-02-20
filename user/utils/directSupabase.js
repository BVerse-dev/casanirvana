// Direct implementation without imports to avoid any module loading issues
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const DIRECT_SUPABASE_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
const DIRECT_SUPABASE_KEY =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!DIRECT_SUPABASE_URL || !DIRECT_SUPABASE_KEY) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing:', { DIRECT_SUPABASE_URL, DIRECT_SUPABASE_KEY });
}

// Custom storage adapter for Expo using SecureStore
const SecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

// Create direct Supabase client with hardcoded values
export const directSupabase = createClient(
  DIRECT_SUPABASE_URL,
  DIRECT_SUPABASE_KEY,
  {
    auth: {
      storage: SecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Export values for use elsewhere
export { DIRECT_SUPABASE_URL, DIRECT_SUPABASE_KEY };
