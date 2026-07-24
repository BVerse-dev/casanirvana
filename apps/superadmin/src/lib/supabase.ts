import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // NextAuth owns access/refresh token rotation for the Superadmin.
    // Persisting and auto-refreshing the same one-time Supabase refresh token
    // here can invalidate the copy held in the encrypted NextAuth session.
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Authentication helpers
export const signIn = async (email: string, password: string) => {
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
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};

// Real-time subscriptions helper
export const subscribeToMessages = (
  roomId: string,
  callback: (payload: any) => void,
) => {
  return supabase
    .channel(`public:messages:room_id=eq.${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `room_id=eq.${roomId}`,
      },
      callback,
    )
    .subscribe();
};

export const subscribeToEmergencyAlerts = (
  communityId: string,
  callback: (payload: any) => void,
) => {
  return supabase
    .channel(`public:emergency_alerts:community_id=eq.${communityId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "emergency_alerts",
        filter: `community_id=eq.${communityId}`,
      },
      callback,
    )
    .subscribe();
};

export default supabase;
