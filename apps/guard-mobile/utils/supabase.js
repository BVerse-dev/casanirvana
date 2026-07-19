import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const fallbackSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const fallbackSupabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const resolvedSupabaseUrl = supabaseUrl || fallbackSupabaseUrl;
const resolvedSupabaseAnonKey = supabaseAnonKey || fallbackSupabaseAnonKey;

if (!resolvedSupabaseUrl || !resolvedSupabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars missing:", {
    expoConfigUrl: supabaseUrl,
    expoConfigAnon: supabaseAnonKey,
    envUrl: fallbackSupabaseUrl,
    envAnon: fallbackSupabaseAnonKey,
  });
}

const authConfig = {
  storage: AsyncStorage,
  storageKey: 'casa_nirvana_guard_auth',
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
};

const globalScope = globalThis;
const clientCacheKey = '__CASA_NIRVANA_GUARD_SUPABASE_CLIENT__';
const appStateListenerKey = '__CASA_NIRVANA_GUARD_SUPABASE_APPSTATE_SUB__';

if (!globalScope[clientCacheKey]) {
  globalScope[clientCacheKey] = createClient(
    resolvedSupabaseUrl,
    resolvedSupabaseAnonKey,
    {
      auth: authConfig,
    }
  );
}

export const supabase = globalScope[clientCacheKey];

if (!globalScope[appStateListenerKey]) {
  if (AppState.currentState === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }

  globalScope[appStateListenerKey] = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
