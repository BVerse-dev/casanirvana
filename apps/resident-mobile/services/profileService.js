import { supabase } from '../utils/supabase';

/**
 * Fetch the current user's profile.
 * Table: users (updated from profiles)
 * @returns {Promise}
 */
export const getCurrentUserProfile = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error(userError?.message || 'No user found');
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to fetch user profile');
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

/**
 * Update the current user's profile.
 * Table: users (updated from profiles)
 * @param {Object} updates - Fields to update
 * @returns {Promise}
 */
export const updateUserProfile = async (updates) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error(userError?.message || 'No user found');
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      throw new Error(error.message || 'Failed to update user profile');
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'An error occurred while updating the profile' };
  }
};
