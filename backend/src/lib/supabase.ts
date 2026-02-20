import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import dotenv from 'dotenv';

dotenv.config();

// Get environment variables for Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and/or SUPABASE_SERVICE_KEY');
}

// Create supabase client with service key for backend operations
export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Create admin client with service role permissions
export const adminSupabase = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey
);

// Create a public client with anonymous key for client-facing operations
export const createPublicClient = (anonKey: string = '') => {
  const key = anonKey || process.env.VITE_SUPABASE_ANON_KEY || '';
  if (!key) {
    throw new Error('Missing anonymous key for public client');
  }
  return createClient<Database>(supabaseUrl, key);
};

export default supabase;
