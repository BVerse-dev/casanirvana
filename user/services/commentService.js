import { supabase } from '../utils/supabase';

/**
 * Get all comments for a notice.
 * Table: comments
 * @param {string} noticeId - Notice ID
 * @returns {Promise}
 */
export const getCommentsForNotice = async (noticeId) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('notice_id', noticeId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

/**
 * Create a new comment.
 * Table: comments
 * @param {Object} comment - Comment object
 * @returns {Promise}
 */
export const createComment = async (comment) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Update a comment.
 * Table: comments
 * @param {string} id - Comment ID
 * @param {Object} updates - Fields to update
 * @returns {Promise}
 */
export const updateComment = async (id, updates) => {
  const { data, error } = await supabase
    .from('comments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Delete a comment.
 * Table: comments
 * @param {string} id - Comment ID
 * @returns {Promise}
 */
export const deleteComment = async (id) => {
  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Like/unlike a comment.
 * Table: comments
 * @param {string} id - Comment ID
 * @param {number} likesCount - New likes count
 * @returns {Promise}
 */
export const updateCommentLikes = async (id, likesCount) => {
  const { data, error } = await supabase
    .from('comments')
    .update({ likes_count: likesCount })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
