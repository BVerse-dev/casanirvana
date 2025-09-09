import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useGuardAuth } from '../contexts/GuardAuthContext';

export const useVisitorPasses = (status = null) => {
  const { guard, user, isAuthenticated } = useGuardAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch visitor passes for the current authenticated guard
  const fetchPasses = useCallback(async () => {
    if (!isAuthenticated || !guard?.society_id) {
      setError('Guard authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('visitor_passes')
        .select(`
          *,
          units (
            id,
            block,
            number,
            unit_number,
            owner_id,
            owner:users!units_owner_id_fkey (
              id,
              first_name,
              last_name,
              phone
            )
          )
        `)
        .eq('society_id', guard.society_id); // Show all passes for the society, not just guard's
      
      if (status) query = query.eq('status', status);
      
      const { data: passesData, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      // Process passes to add host information
      const passesWithHosts = await Promise.all(
        (passesData || []).map(async (pass) => {
          if (pass.units) {
            // Try to find a direct resident first
            const { data: residentData } = await supabase
              .from('users')
              .select('id, first_name, last_name, phone')
              .eq('unit_id', pass.units.id)
              .eq('role', 'user')
              .limit(1)
              .single();
            
            let hostInfo = null;
            if (residentData) {
              hostInfo = {
                id: residentData.id,
                full_name: `${residentData.first_name} ${residentData.last_name}`.trim(),
                phone: residentData.phone
              };
            } else if (pass.units.owner) {
              // Use the owner data from the join
              hostInfo = {
                id: pass.units.owner.id,
                full_name: `${pass.units.owner.first_name} ${pass.units.owner.last_name}`.trim(),
                phone: pass.units.owner.phone
              };
            }
            
            return { ...pass, host_resident: hostInfo };
          }
          return { ...pass, host_resident: null };
        })
      );
      
      setPasses(passesWithHosts);
    } catch (err) {
      setError(err.message || 'Failed to fetch visitor passes');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, guard?.society_id, status]);

  // Update visitor pass status (check-in/out, approve/reject)
  const updatePassStatus = async (passId, newStatus, guardNotes = null) => {
    if (!isAuthenticated || !guard?.society_id || !user?.id) {
      setError('Guard authentication required');
      return;
    }

    try {
      const updateData = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (guardNotes) updateData.guard_notes = guardNotes;
      
      // Add guard tracking fields based on status
      if (newStatus === 'checked_in') {
        updateData.checked_in_by = user.id; // Use user.id for guard tracking
        updateData.actual_entry_time = new Date().toISOString();
      } else if (newStatus === 'checked_out') {
        updateData.checked_out_by = user.id; // Use user.id for guard tracking
        updateData.actual_exit_time = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('visitor_passes')
        .update(updateData)
        .eq('id', passId)
        .eq('society_id', guard.society_id); // Security: Only guard's society
        
      if (error) throw error;
      fetchPasses();
    } catch (err) {
      setError(err.message || 'Failed to update pass status');
    }
  };

  // Create walk-in visitor pass (industry standard: auto-populate guard info)
  const createVisitorPass = async (entryData) => {
    if (!isAuthenticated || !guard?.id || !user?.id) {
      const errorMsg = 'Guard authentication required';
      console.error('createVisitorPass failed:', errorMsg);
      setError(errorMsg);
      return null;
    }

    try {
      const visitorPassData = {
        ...entryData,
        created_by: user.id,           // Auth context: user ID
        approved_by: user.id,          // Auth context: user ID (fixed to use user.id)
        society_id: guard.society_id,  // Auth context: guard's society
        entry_method: 'walk_in',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      console.log('Creating visitor pass with final data:', visitorPassData);

      const { data, error } = await supabase
        .from('visitor_passes')
        .insert([visitorPassData])
        .select('id')
        .single();
        
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('✅ Visitor pass created successfully:', data);
      fetchPasses();
      return data?.id || null; // Return visitor pass ID
    } catch (err) {
      console.error('createVisitorPass error:', err);
      setError(err.message || 'Failed to create visitor pass');
      return null;
    }
  };

  // Get pass details (for QR scan, etc)
  const getPassDetails = async (passId) => {
    try {
      const { data, error } = await supabase
        .from('visitor_passes')
        .select(`
          *,
          units (
            id,
            block,
            number
          )
        `)
        .eq('id', passId)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message || 'Failed to get pass details');
      return null;
    }
  };

  // Real-time subscription for passes (scoped to guard's society)
  useEffect(() => {
    if (!isAuthenticated || !guard?.society_id || !user?.id) return;
    
    fetchPasses();
    
    // Create unique channel name including status and timestamp to avoid conflicts
    const timestamp = Date.now();
    const channelName = `visitor_passes_${guard.society_id}_${user.id}_${status || 'all'}_${timestamp}`;
    
    let subscription;
    try {
      subscription = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'visitor_passes',
          filter: `society_id=eq.${guard.society_id}`,
        }, (payload) => {
          console.log('Real-time update:', payload);
          fetchPasses();
        })
        .subscribe();
    } catch (error) {
      console.warn('Subscription error (non-critical):', error);
    }
      
    return () => {
      if (subscription) {
        try {
          supabase.removeChannel(subscription);
        } catch (error) {
          console.warn('Unsubscribe error (non-critical):', error);
        }
      }
    };
  }, [isAuthenticated, guard?.society_id, user?.id, status]); // Removed fetchPasses dependency

  return {
    passes,
    loading,
    error,
    updatePassStatus,
    createVisitorPass,
    getPassDetails,
    fetchPasses,
  };
}
