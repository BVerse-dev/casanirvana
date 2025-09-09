import { supabase } from '../utils/supabase';

export const guardAuthUtils = {
  /**
   * Check if current user is authenticated and has guard role
   */
  isAuthenticatedGuard: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.user) {
        return false;
      }

      // Verify user has guard role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .eq('role', 'guard')
        .single();

      return !!userData && !userError;
    } catch (err) {
      console.error('Error checking guard authentication:', err);
      return false;
    }
  },

  /**
   * Get current guard profile
   */
  getGuardProfile: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.user) {
        return null;
      }

      // Get user with guard role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role, community_id, phone')
        .eq('id', session.user.id)
        .eq('role', 'guard')
        .single();

      if (userError || !userData) {
        return null;
      }

      // Get guard extended profile
      const { data: guardData, error: guardError } = await supabase
        .from('guards')
        .select(`
          id, employee_id, full_name, shift_type, society_id, status,
          phone, mobile, emergency_contact_phone, rating, total_shifts,
          completed_shifts, gate_assignment, society_assignment, last_login
        `)
        .eq('user_id', userData.id)
        .single();

      if (guardError) {
        console.warn('Guard profile not found:', guardError);
        return { user: userData, guard: null };
      }

      return { user: userData, guard: guardData };
    } catch (err) {
      console.error('Error getting guard profile:', err);
      return null;
    }
  },

  /**
   * Sign out current guard
   */
  signOutGuard: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      return true;
    } catch (err) {
      console.error('Error signing out guard:', err);
      throw err;
    }
  },

  /**
   * Validate guard role on critical operations
   */
  validateGuardRole: async () => {
    const isValid = await guardAuthUtils.isAuthenticatedGuard();
    if (!isValid) {
      throw new Error('Guard authentication required for this operation');
    }
    return true;
  },

  /**
   * Get guard's assigned society ID
   */
  getAssignedSocietyId: async () => {
    try {
      const profile = await guardAuthUtils.getGuardProfile();
      return profile?.user?.community_id || profile?.guard?.society_id || null;
    } catch (err) {
      console.error('Error getting assigned society:', err);
      return null;
    }
  },
};
