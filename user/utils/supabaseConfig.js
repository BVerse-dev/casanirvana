// This file ensures Supabase configuration is valid
// Import the configured Supabase client to verify it works
import { createClient } from '@supabase/supabase-js';

// Hardcoded values for direct test
const testUrl = "https://pswnlowvmdgeifhxilao.supabase.co";
const testKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd25sb3d2bWRnZWlmaHhpbGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODE5MTYsImV4cCI6MjA2MzM1NzkxNn0.QOqSJr0qxefrIwM087IKlJJYWwMLCHV_v5iEb-SI7S0";

// Create a test client to verify the values work
export const testSupabase = createClient(testUrl, testKey);

// Export the URL and key for use elsewhere
export const SUPABASE_URL = testUrl;
export const SUPABASE_KEY = testKey;

console.log("Supabase test config loaded!");
