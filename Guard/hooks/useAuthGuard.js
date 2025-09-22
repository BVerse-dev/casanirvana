import { useState } from 'react';
import { supabase } from '../utils/supabase';

export const useAuthGuard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // First, authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('No user data returned from authentication');
      }

      // Verify user has guard role and get guard profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role, community_id, created_at')
        .eq('id', authData.user.id)
        .eq('role', 'guard')
        .single();

      if (userError) {
        throw new Error('Failed to verify guard credentials');
      }

      if (!userData) {
        // Sign out the user since they're not a guard
        await supabase.auth.signOut();
        throw new Error('Access denied: Guard credentials required');
      }

      // Get extended guard profile
      const { data: guardData, error: guardError } = await supabase
        .from('guards')
        .select(`
          id, employee_id, full_name, shift_type, community_id, status, 
          phone, emergency_contact_phone, rating, total_shifts, 
          completed_shifts, last_login, gate_assignment
        `)
        .eq('user_id', userData.id)
        .single();

      if (guardError) {
        console.warn('Guard profile not found, user may need guard record created:', guardError);
      }

      // Update last login timestamp
      if (guardData) {
        await supabase
          .from('guards')
          .update({ last_login: new Date().toISOString() })
          .eq('id', guardData.id);
      }

      return {
        user: userData,
        guard: guardData,
        session: authData.session,
      };
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during sign in';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw new Error(error.message);
      }
      return session;
    } catch (err) {
      console.error('Error getting current session:', err);
      return null;
    }
  };

  const getCurrentGuard = async () => {
    try {
      const session = await getCurrentSession();
      if (!session?.user) {
        return null;
      }

      // Get user data with guard role verification
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role, community_id')
        .eq('id', session.user.id)
        .eq('role', 'guard')
        .single();

      if (userError || !userData) {
        return null;
      }

      // Get guard profile
      const { data: guardData, error: guardError } = await supabase
        .from('guards')
        .select(`
          id, employee_id, full_name, shift_type, community_id, status, 
          phone, emergency_contact_phone, rating, total_shifts, 
          completed_shifts, gate_assignment
        `)
        .eq('user_id', userData.id)
        .single();

      if (guardError) {
        console.warn('Guard profile not found:', guardError);
        return { user: userData, guard: null };
      }

      return { user: userData, guard: guardData };
    } catch (err) {
      console.error('Error getting current guard:', err);
      return null;
    }
  };

  // Fetch all profile bar data for the current guard
  const getProfileBarData = async () => {
    try {
      const session = await getCurrentSession();
      if (!session?.user) return null;

      // Get user data with guard role verification
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role')
        .eq('id', session.user.id)
        .eq('role', 'guard')
        .single();
      if (userError || !userData) return null;

      // Get guard profile
      const { data: guardProfile, error: guardError } = await supabase
        .from('guards')
        .select('id, full_name, avatar_url, community_id')
        .eq('user_id', userData.id)
        .single();
      if (guardError || !guardProfile) return null;

      // Get assignment details
      const { data: assignment, error: assignmentError } = await supabase
        .from('guard_assignments')
        .select('assignment_name, community_id')
        .eq('guard_id', guardProfile.id)
        .eq('current_status', 'active')
        .single();

      // Get community name
      const { data: society, error: societyError } = await supabase
        .from('communities')
        .select('name')
        .eq('id', guardProfile.community_id)
        .single();

      // Get unread notification count
      const { count: unreadCount, error: notificationError } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)
        .eq('is_read', false);

      return {
        avatar: guardProfile.avatar_url,
        name: guardProfile.full_name,
        assignment: assignment?.assignment_name ?? null,
        society: society?.name ?? null,
        notificationCount: unreadCount ?? 0,
      };
    } catch (err) {
      console.error('Error fetching profile bar data:', err);
      return null;
    }
  };

  return {
    signInWithEmail,
    signOut,
    getCurrentSession,
    getCurrentGuard,
    getProfileBarData,
    loading,
    error,
  };
};
