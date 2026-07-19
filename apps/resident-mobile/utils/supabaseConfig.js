// This file ensures Supabase configuration is valid
// Import the configured Supabase client to verify it works
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const testUrl =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
const testKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!testUrl || !testKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing:', { testUrl, testKey });
}

export const testSupabase = createClient(testUrl, testKey);
export const SUPABASE_URL = testUrl;
export const SUPABASE_KEY = testKey;
