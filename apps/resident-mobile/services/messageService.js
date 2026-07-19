import { supabase } from '../utils/supabase';

/**
 * Send a new message.
 * Table: messages
 * @param {Object} message - Message object (from_user, to_user, content, etc)
 * @returns {Promise}
 */
export const sendMessage = async (message) =>
  await supabase.from('messages').insert([message]);

/**
 * Get messages for a user with optional filters, pagination, and sorting.
 * Table: messages
 * @param {Object} params - { user_id, limit, page, orderBy, ascending, search }
 * @returns {Promise}
 */
export const getMessagesForUser = async ({
  user_id,
  limit = 20,
  page = 1,
  orderBy = 'sent_at',
  ascending = false,
  search = ''
} = {}) => {
  let query = supabase.from('messages').select('*', { count: 'exact' });
  if (user_id) query = query.or(`from_user.eq.${user_id},to_user.eq.${user_id}`);
  if (search) query = query.ilike('content', `%${search}%`);
  query = query.order(orderBy, { ascending });
  if (limit) query = query.range((page - 1) * limit, page * limit - 1);
  return await query;
};
