import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const GuardAuthContext = createContext({});

export const useGuardAuth = () => {
  const context = useContext(GuardAuthContext);
  if (!context) {
    throw new Error('useGuardAuth must be used within a GuardAuthProvider');
  }
  return context;
};

export const GuardAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [guard, setGuard] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadGuardProfile = async (userId) => {
    try {
      // Get user data with guard role verification
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role, community_id, phone, created_at')
        .eq('id', userId)
        .eq('role', 'guard')
        .single();

      if (userError || !userData) {
        console.warn('User is not a guard or not found:', userError);
        return null;
      }

      // Get guard profile
      const { data: guardData, error: guardError } = await supabase
        .from('guards')
        .select(`
          id, employee_id, full_name, first_name, last_name, shift_type, 
          society_id, status, phone, mobile, emergency_contact_phone, 
          rating, total_shifts, completed_shifts, gate_assignment, 
          society_assignment, experience_years, is_active, last_login
        `)
        .eq('user_id', userData.id)
        .single();

      if (guardError) {
        console.warn('Guard profile not found:', guardError);
        return { user: userData, guard: null };
      }

      return { user: userData, guard: guardData };
    } catch (err) {
      console.error('Error loading guard profile:', err);
      return null;
    }
  };

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Get current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return;
      }

      if (currentSession?.user) {
        setSession(currentSession);
        
        // Load guard profile
        const guardProfile = await loadGuardProfile(currentSession.user.id);
        if (guardProfile) {
          setUser(guardProfile.user);
          setGuard(guardProfile.guard);
        } else {
          // User exists but is not a guard, sign them out
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setGuard(null);
        }
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Load guard profile
      const guardProfile = await loadGuardProfile(authData.user.id);
      if (!guardProfile) {
        await supabase.auth.signOut();
        throw new Error('Access denied: Guard credentials required');
      }

      setSession(authData.session);
      setUser(guardProfile.user);
      setGuard(guardProfile.guard);

      // Update last login if guard profile exists
      if (guardProfile.guard) {
        await supabase
          .from('guards')
          .update({ last_login: new Date().toISOString() })
          .eq('id', guardProfile.guard.id);
      }

      return guardProfile;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
  };

  const refreshGuardProfile = async () => {
    if (!user?.id) return;
    
    const guardProfile = await loadGuardProfile(user.id);
    if (guardProfile) {
      setUser(guardProfile.user);
      setGuard(guardProfile.guard);
    }
  };

  useEffect(() => {
    // Initialize authentication on mount
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const guardProfile = await loadGuardProfile(session.user.id);
        if (guardProfile) {
          setSession(session);
          setUser(guardProfile.user);
          setGuard(guardProfile.guard);
        } else {
          // Not a guard, sign out
          await supabase.auth.signOut();
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setGuard(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setSession(session);
      }
      
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    guard,
    session,
    loading,
    initialized,
    isAuthenticated: !!user && !!session,
    isGuard: !!user && user.role === 'guard',
    signIn,
    signOut,
    refreshGuardProfile,
  };

  return (
    <GuardAuthContext.Provider value={value}>
      {children}
    </GuardAuthContext.Provider>
  );
};
