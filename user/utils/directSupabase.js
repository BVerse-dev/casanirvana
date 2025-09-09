// Direct implementation without imports to avoid any module loading issues
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Hardcoded values - no dependencies
const DIRECT_SUPABASE_URL = "https://pswnlowvmdgeifhxilao.supabase.co";
const DIRECT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd25sb3d2bWRnZWlmaHhpbGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODE5MTYsImV4cCI6MjA2MzM1NzkxNn0.QOqSJr0qxefrIwM087IKlJJYWwMLCHV_v5iEb-SI7S0";

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
