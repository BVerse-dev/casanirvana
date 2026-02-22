import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useGuardAuth } from '../contexts/GuardAuthContext';

export const useVisitorPassCounts = () => {
  const { guard, user, isAuthenticated } = useGuardAuth();
  const [insideCount, setInsideCount] = useState(0);
  const [outsideCount, setOutsideCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCounts = useCallback(async () => {
    if (!isAuthenticated || !guard?.community_id) {
      setInsideCount(0);
      setOutsideCount(0);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [insideResult, outsideResult] = await Promise.all([
        supabase
          .from('visitor_passes')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', guard.community_id)
          .eq('status', 'checked_in')
          .is('actual_exit_time', null)
          .is('checked_out_at', null),
        supabase
          .from('visitor_passes')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', guard.community_id)
          .or('status.eq.checked_out,actual_exit_time.not.is.null,checked_out_at.not.is.null'),
      ]);

      if (insideResult.error) {
        throw insideResult.error;
      }
      if (outsideResult.error) {
        throw outsideResult.error;
      }

      setInsideCount(insideResult.count || 0);
      setOutsideCount(outsideResult.count || 0);
    } catch (err) {
      setError(err?.message || 'Failed to fetch visitor counts');
      setInsideCount(0);
      setOutsideCount(0);
    } finally {
      setLoading(false);
    }
  }, [guard?.community_id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !guard?.community_id || !user?.id) {
      return undefined;
    }

    fetchCounts();

    const channel = supabase
      .channel(`visitor_pass_counts_${guard.community_id}_${user.id}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visitor_passes',
          filter: `community_id=eq.${guard.community_id}`,
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCounts, guard?.community_id, isAuthenticated, user?.id]);

  return {
    insideCount,
    outsideCount,
    loading,
    error,
    fetchCounts,
  };
};

export default useVisitorPassCounts;
