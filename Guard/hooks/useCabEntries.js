import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useGuardAuth } from '../contexts/GuardAuthContext';
import {
  buildVisitorQrPayload,
  createVisitorPassToken,
  generateVisitorEntryCode,
} from '../services/visitorPassArtifacts';

export const useCabEntries = (status = null) => {
  const { guard, user, isAuthenticated } = useGuardAuth();
  const [cabEntries, setCabEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cab entries for the current authenticated guard
  const fetchCabEntries = useCallback(async () => {
    if (!isAuthenticated || !guard?.community_id || !user?.id) {
      setError('Guard authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('visitor_passes')
        .select('*')
        .eq('visitor_type', 'cab')
        .eq('community_id', guard.community_id); // Security: Only guard's assigned society
      
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setCabEntries(data || []);
    } catch (err) {
      console.error('fetchCabEntries error:', err);
      setError(err.message || 'Failed to fetch cab entries');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, guard?.community_id, user?.id, status]);

  // Update cab entry status (check-in/out, approve/reject)
  const updateCabStatus = async (entryId, newStatus, guardNotes = null) => {
    if (!isAuthenticated || !guard?.community_id || !user?.id) {
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
        const nowIso = new Date().toISOString();
        updateData.checked_in_by = user.id;
        updateData.checked_in_at = nowIso;
        updateData.actual_entry_time = nowIso;
      } else if (newStatus === 'checked_out') {
        const nowIso = new Date().toISOString();
        updateData.checked_out_by = user.id;
        updateData.checked_out_at = nowIso;
        updateData.actual_exit_time = nowIso;
      }
      
      const { error } = await supabase
        .from('visitor_passes')
        .update(updateData)
        .eq('id', entryId)
        .eq('community_id', guard.community_id); // Security: Only guard's society
        
      if (error) throw error;
      fetchCabEntries();
    } catch (err) {
      console.error('updateCabStatus error:', err);
      setError(err.message || 'Failed to update cab status');
    }
  };

  // Create walk-in cab entry (industry standard: auto-populate guard info)
  const createCabEntry = async (cabEntryData) => {
    if (!isAuthenticated || !guard?.id || !user?.id) {
      const errorMsg = 'Guard authentication required';
      console.error('createCabEntry failed:', errorMsg);
      setError(errorMsg);
      return null;
    }

    try {
      const fromDate = cabEntryData.from_date || new Date().toISOString();
      const toDate =
        cabEntryData.to_date ||
        new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
      const entryCode = generateVisitorEntryCode();
      const visitorPassToken = createVisitorPassToken();
      const qrCodeData = buildVisitorQrPayload({
        token: visitorPassToken,
        entryCode,
        visitorName: cabEntryData.driver_name,
        visitorPhone: cabEntryData.driver_phone || '',
        unitId: cabEntryData.unit_id,
        fromDate,
        toDate,
        createdBy: user.id,
        purpose: cabEntryData.service_type || 'Cab service',
        visitorType: 'cab',
        companyName: cabEntryData.company_name || null,
        serviceType: cabEntryData.service_type || null,
        vehicleType: 'cab',
        vehicleNumber: cabEntryData.vehicle_number || null,
        driverName: cabEntryData.driver_name || null,
      });

      // LESSON LEARNED: Use correct field names from the start
      const cabPassData = {
        visitor_name: cabEntryData.driver_name,           // Driver name as visitor name
        visitor_phone: cabEntryData.driver_phone || '',   // Driver phone if available
        unit_id: cabEntryData.unit_id,                   // Selected unit
        purpose: cabEntryData.service_type || 'Cab service', // Pickup/dropoff purpose
        from_date: fromDate,               // LESSON: Use from_date not expected_entry_time
        to_date: toDate,                   // LESSON: Use to_date not expected_exit_time
        entry_code: entryCode,
        qr_code_data: qrCodeData,
        
        // Cab-specific fields
        driver_name: cabEntryData.driver_name,
        company_name: cabEntryData.company_name,
        service_type: cabEntryData.service_type,         // Pickup/Dropoff type
        vehicle_number: cabEntryData.vehicle_number,     // Last 4 digits
        vehicle_type: 'cab',
        visitor_type: 'cab',                             // Entry type
        
        // Auth context fields (LESSON: Always include these)
        created_by: user.id,
        approved_by: user.id,
        community_id: guard.community_id,
        entry_method: 'walk_in',
        status: 'pending',
        
        // Guard notes
        guard_notes: cabEntryData.guard_notes || `Cab entry created by guard for ${cabEntryData.company_name}`
      };

      const { data, error } = await supabase
        .from('visitor_passes')
        .insert([cabPassData])
        .select('id')
        .single();
        
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      fetchCabEntries();
      return data?.id || null; // Return cab entry ID
    } catch (err) {
      console.error('createCabEntry error:', err);
      setError(err.message || 'Failed to create cab entry');
      return null;
    }
  };

  // Get cab entry details (for QR scan, etc)
  const getCabEntryDetails = async (entryId) => {
    try {
      const { data, error } = await supabase
        .from('visitor_passes')
        .select('*')
        .eq('id', entryId)
        .eq('visitor_type', 'cab')
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('getCabEntryDetails error:', err);
      setError(err.message || 'Failed to get cab entry details');
      return null;
    }
  };

  // Handle real-time updates for cab entries
  const handleRealtimeUpdate = useCallback((updatedEntry) => {
    if (!updatedEntry || updatedEntry.visitor_type !== 'cab') return;
    
    setCabEntries(prevEntries => {
      const entryIndex = prevEntries.findIndex(entry => entry.id === updatedEntry.id);
      if (entryIndex >= 0) {
        // Update existing entry
        const newEntries = [...prevEntries];
        newEntries[entryIndex] = updatedEntry;
        return newEntries;
      } else {
        // Add new entry if it matches current filter
        if (!status || updatedEntry.status === status) {
          return [updatedEntry, ...prevEntries];
        }
        return prevEntries;
      }
    });
  }, [status]);

  // Real-time subscription for cab entries (scoped to guard's society)
  useEffect(() => {
    if (!isAuthenticated || !guard?.community_id || !user?.id) return;
    
    fetchCabEntries();
    
    // LESSON LEARNED: Create unique channel name to avoid conflicts
    const timestamp = Date.now();
    const channelName = `cab_entries_${guard.community_id}_${user.id}_${status || 'all'}_${timestamp}`;
    
    let subscription;
    try {
      subscription = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'visitor_passes',
          filter: `community_id=eq.${guard.community_id}`,
        }, (payload) => {
                    // Only update if it's a cab entry
          if (payload.new?.visitor_type === 'cab' || payload.old?.visitor_type === 'cab') {
            handleRealtimeUpdate(payload.new);
          }
        })
        .subscribe();
    } catch (error) {
      console.warn('Cab entry subscription error (non-critical):', error);
    }
      
    return () => {
      if (subscription) {
        try {
          supabase.removeChannel(subscription);
        } catch (error) {
          console.warn('Cab entry unsubscribe error (non-critical):', error);
        }
      }
    };
  }, [isAuthenticated, guard?.community_id, user?.id, status, handleRealtimeUpdate]);

  return {
    cabEntries,
    loading,
    error,
    updateCabStatus,
    createCabEntry,
    getCabEntryDetails,
    fetchCabEntries,
  };
};
