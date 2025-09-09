import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';

export const useEntryLogs = (guardId, filters = {}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch entry logs for the current guard
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('entry_logs')
        .select('*')
        .eq('guard_id', guardId);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      const { data, error } = await query.order('timestamp', { ascending: false });
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch entry logs');
    } finally {
      setLoading(false);
    }
  }, [guardId, JSON.stringify(filters)]);

  // Update entry exit time
  const updateEntryExit = async (entryId, exitData) => {
    try {
      const { error } = await supabase
        .from('entry_logs')
        .update(exitData)
        .eq('id', entryId);
      if (error) throw error;
      fetchLogs();
    } catch (err) {
      setError(err.message || 'Failed to update entry exit');
    }
  };

  // Create entry log (for check-in)
  const createEntryLog = async (entryData) => {
    try {
      const { error } = await supabase
        .from('entry_logs')
        .insert([entryData]);
      if (error) throw error;
      fetchLogs();
    } catch (err) {
      setError(err.message || 'Failed to create entry log');
    }
  };

  // Real-time subscription for entry logs
  useEffect(() => {
    fetchLogs();
    const subscription = supabase
      .channel(`entry_logs_${guardId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'entry_logs',
        filter: `guard_id=eq.${guardId}`,
      }, (payload) => {
        console.log('Entry log update:', payload);
        fetchLogs();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [guardId, JSON.stringify(filters)]); // Removed fetchLogs dependency

  return {
    logs,
    loading,
    error,
    updateEntryExit,
    createEntryLog,
    fetchLogs,
  };
}
