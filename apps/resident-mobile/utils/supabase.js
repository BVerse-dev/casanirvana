import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const supabaseUrl =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing:', { supabaseUrl, supabaseAnonKey });
}

const WebStorageAdapter = {
  getItem: (key) => {
    try {
      if (typeof localStorage === 'undefined') return Promise.resolve(null);
      return Promise.resolve(localStorage.getItem(key));
    } catch (error) {
      console.warn('Web storage read failed:', error);
      return Promise.resolve(null);
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof localStorage === 'undefined') return Promise.resolve();
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Web storage write failed:', error);
    }
    return Promise.resolve();
  },
  removeItem: (key) => {
    try {
      if (typeof localStorage === 'undefined') return Promise.resolve();
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Web storage remove failed:', error);
    }
    return Promise.resolve();
  },
};

const NativeSecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

const StorageAdapter = Platform.OS === 'web'
  ? WebStorageAdapter
  : NativeSecureStoreAdapter;

// Create a supabase client with secure storage for auth persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: StorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Authentication helpers
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};
