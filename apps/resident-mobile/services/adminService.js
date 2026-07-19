import { supabase } from '../utils/supabase';

/**
 * Fetch all users (admin only).
 * Table: users (updated from profiles)
 * @returns {Promise}
 */
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw new Error(error.message);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to fetch users' };
  }
};

/**
 * Update a user's role (admin only).
 * Table: users (updated from profiles)
 * @param {string} userId - User ID
 * @param {string} role - New role
 * @returns {Promise}
 */
export const updateUserRole = async (userId, role) => {
  try {
    const { data, error } = await supabase.from('users').update({ role }).eq('id', userId);
    if (error) throw new Error(error.message);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to update user role' };
  }
};

/**
 * Delete a user (admin only).
 * Table: users (updated from profiles)
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const deleteUser = async (userId) => {
  try {
    const { data, error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      throw new Error(error.message);
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to delete user' };
  }
};
