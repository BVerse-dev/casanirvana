import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { useRealtimeSubscriptions } from '../hooks/useRealtimeSubscriptions';
import { useGetProfile } from '../hooks/useSupabaseData';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface Props {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user || null;
  const { data: profile, error: profileError, isLoading: profileLoading } = useGetProfile(user?.id ?? undefined);

  // Debug profile loading
  useEffect(() => {
    if (user?.id) {
      console.log('AuthContext - User ID:', user.id);
      console.log('AuthContext - Profile loading:', profileLoading);
      console.log('AuthContext - Profile data:', profile);
      console.log('AuthContext - Profile error:', profileError);
    }
  }, [user?.id, profile, profileError, profileLoading]);

  // Set up real-time subscriptions when user is authenticated
  useRealtimeSubscriptions(
    user?.id,
    profile?.unit_id || undefined,
    profile?.community_id || undefined,
    profile?.id || undefined
  );

  useEffect(() => {
    // Get initial session with debugging
    console.log('🔍 AuthContext: Getting initial session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔍 AuthContext: Initial session result:', {
        hasSession: !!session,
        sessionUserId: session?.user?.id,
        sessionEmail: session?.user?.email,
        error: error?.message
      });
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    console.log('🔍 AuthContext: Setting up auth state listener...');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 AuthContext: Auth state changed:', {
        event,
        hasSession: !!session,
        sessionUserId: session?.user?.id,
        sessionEmail: session?.user?.email
      });
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
