import { supabase } from '../utils/supabase';

/**
 * Create a new event (admin only).
 * Table: events
 * @param {Object} event - Event object (title, date, etc)
 * @returns {Promise}
 */
export const createEvent = async (event) =>
  await supabase.from('events').insert([event]);

/**
 * Fetch all events.
 * Table: events
 * @returns {Promise}
 */
export const getEvents = async () =>
  await supabase.from('events').select('*');

/**
 * Update an event (admin only).
 * Table: events
 * @param {number} id - Event ID
 * @param {Object} updates - Fields to update
 * @returns {Promise}
 */
export const updateEvent = async (id, updates) =>
  await supabase.from('events').update(updates).eq('id', id);

/**
 * Delete an event (admin only).
 * Table: events
 * @param {number} id - Event ID
 * @returns {Promise}
 */
export const deleteEvent = async (id) =>
  await supabase.from('events').delete().eq('id', id);
