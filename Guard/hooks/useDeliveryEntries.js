import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useGuardAuth } from '../contexts/GuardAuthContext';

export const useDeliveryEntries = (status = null) => {
  const { guard, user, isAuthenticated } = useGuardAuth();
  const [deliveryEntries, setDeliveryEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch delivery entries for the current authenticated guard
  const fetchDeliveryEntries = useCallback(async () => {
    if (!isAuthenticated || !guard?.society_id || !user?.id) {
      setError('Guard authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('visitor_passes')
        .select('*')
        .eq('visitor_type', 'delivery')
        .eq('society_id', guard.society_id); // Security: Only guard's assigned society
      
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setDeliveryEntries(data || []);
    } catch (err) {
      console.error('fetchDeliveryEntries error:', err);
      setError(err.message || 'Failed to fetch delivery entries');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, guard?.society_id, user?.id, status]);

  // Update delivery entry status (check-in/out, approve/reject)
  const updateDeliveryStatus = async (entryId, newStatus, guardNotes = null) => {
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
        updateData.checked_in_by = user.id;
        updateData.actual_entry_time = new Date().toISOString();
      } else if (newStatus === 'checked_out') {
        updateData.checked_out_by = user.id;
        updateData.actual_exit_time = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('visitor_passes')
        .update(updateData)
        .eq('id', entryId)
        .eq('society_id', guard.society_id); // Security: Only guard's society
        
      if (error) throw error;
      fetchDeliveryEntries();
    } catch (err) {
      console.error('updateDeliveryStatus error:', err);
      setError(err.message || 'Failed to update delivery status');
    }
  };

  // Create walk-in delivery entry (industry standard: auto-populate guard info)
  const createDeliveryEntry = async (deliveryEntryData) => {
    if (!isAuthenticated || !guard?.id || !user?.id) {
      const errorMsg = 'Guard authentication required';
      console.error('createDeliveryEntry failed:', errorMsg);
      setError(errorMsg);
      return null;
    }

    try {
      // Professional delivery entry data structure (following cab pattern)
      const deliveryPassData = {
        visitor_name: deliveryEntryData.driver_name,           // Delivery person name as visitor name
        visitor_phone: deliveryEntryData.driver_phone || '',   // Driver phone if available
        unit_id: deliveryEntryData.unit_id,                   // Selected unit
        purpose: deliveryEntryData.delivery_purpose || 'Package delivery', // Delivery purpose
        from_date: deliveryEntryData.from_date,               // Expected delivery time
        to_date: deliveryEntryData.to_date,                   // Expected completion time
        
        // Delivery-specific fields
        driver_name: deliveryEntryData.driver_name,
        company_name: deliveryEntryData.company_name,
        service_type: deliveryEntryData.service_type || 'Package delivery', // Service type
        delivery_details: deliveryEntryData.delivery_details || 'Package delivery',
        vehicle_type: 'delivery',
        visitor_type: 'delivery',                             // Entry type
        
        // Auth context fields (Always include these)
        created_by: user.id,
        approved_by: user.id,
        society_id: guard.society_id,
        entry_method: 'walk_in',
        status: 'pending',
        created_at: new Date().toISOString(),
        
        // Guard notes
        guard_notes: deliveryEntryData.guard_notes || `Delivery entry created by guard for ${deliveryEntryData.company_name}`
      };

      const { data, error } = await supabase
        .from('visitor_passes')
        .insert([deliveryPassData])
        .select('id')
        .single();
        
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      fetchDeliveryEntries();
      return data?.id || null; // Return delivery entry ID
    } catch (err) {
      console.error('createDeliveryEntry error:', err);
      setError(err.message || 'Failed to create delivery entry');
      return null;
    }
  };

  // Get delivery entry details (for QR scan, etc)
  const getDeliveryEntryDetails = async (entryId) => {
    try {
      const { data, error } = await supabase
        .from('visitor_passes')
        .select('*')
        .eq('id', entryId)
        .eq('visitor_type', 'delivery')
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('getDeliveryEntryDetails error:', err);
      setError(err.message || 'Failed to get delivery entry details');
      return null;
    }
  };

  // Handle real-time updates for delivery entries
  const handleRealtimeUpdate = useCallback((updatedEntry) => {
    if (!updatedEntry || updatedEntry.visitor_type !== 'delivery') return;
    
    setDeliveryEntries(prevEntries => {
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

  // Real-time subscription for delivery entries (scoped to guard's society)
  useEffect(() => {
    if (!isAuthenticated || !guard?.society_id || !user?.id) return;
    
    fetchDeliveryEntries();
    
    // Create unique channel name to avoid conflicts
    const timestamp = Date.now();
    const channelName = `delivery_entries_${guard.society_id}_${user.id}_${status || 'all'}_${timestamp}`;
    
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
          // Only update if it's a delivery entry
          if (payload.new?.visitor_type === 'delivery' || payload.old?.visitor_type === 'delivery') {
            handleRealtimeUpdate(payload.new);
          }
        })
        .subscribe();
    } catch (error) {
      console.warn('Delivery entry subscription error (non-critical):', error);
    }
      
    return () => {
      if (subscription) {
        try {
          supabase.removeChannel(subscription);
        } catch (error) {
          console.warn('Delivery entry unsubscribe error (non-critical):', error);
        }
      }
    };
  }, [isAuthenticated, guard?.society_id, user?.id, status, handleRealtimeUpdate]);

  return {
    deliveryEntries,
    loading,
    error,
    updateDeliveryStatus,
    createDeliveryEntry,
    getDeliveryEntryDetails,
    fetchDeliveryEntries,
  };
};
