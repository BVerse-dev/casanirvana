import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const useGuardAssignment = () => {
  const [assignment, setAssignment] = useState(null);
  const [society, setSociety] = useState(null);
  const [guardProfile, setGuardProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignmentData();
  }, []);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current authenticated user
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser.user) {
        setError('Not authenticated');
        return;
      }

      // Get user profile to find profile ID
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('email', authUser.user.email)
        .single();

      if (profileError || !userProfile) {
        setError('User profile not found');
        return;
      }

      // Fetch guard profile data
      const { data: guard, error: guardError } = await supabase
        .from('guards')
        .select('*')
        .eq('user_id', userProfile.id)
        .single();

      if (guardError) {
        console.error('Guard profile error:', guardError);
      } else {
        setGuardProfile(guard);
      }

      // Fetch current assignment using profile ID
      const { data: assignments, error: assignmentError } = await supabase
        .from('guard_assignments')
        .select(`
          *,
          societies:society_id (
            name,
            address,
            phone,
            email
          )
        `)
        .eq('guard_id', userProfile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (assignmentError) {
        setError('Failed to fetch assignment data');
        console.error('Assignment error:', assignmentError);
        return;
      }

      if (assignments && assignments.length > 0) {
        const currentAssignment = assignments[0];
        setAssignment(currentAssignment);
        setSociety(currentAssignment.societies);
      } else {
        setAssignment(null);
        setSociety(null);
      }

    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Assignment fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    assignment,
    society,
    guardProfile,
    loading,
    error,
    refetch: fetchAssignmentData
  };
};

export default useGuardAssignment;
