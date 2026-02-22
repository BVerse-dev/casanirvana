import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useGuardAuth } from '../contexts/GuardAuthContext';
import {
  buildVisitorQrPayload,
  createVisitorPassToken,
  generateVisitorEntryCode,
} from '../services/visitorPassArtifacts';

export const useServiceEntries = (status = null) => {
  const { guard, user, isAuthenticated } = useGuardAuth();
  const [serviceEntries, setServiceEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch service entries for the current authenticated guard
  const fetchServiceEntries = useCallback(async () => {
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
        .eq('visitor_type', 'service')
        .eq('community_id', guard.community_id); // Security: Only guard's assigned society
      
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setServiceEntries(data || []);
    } catch (err) {
      console.error('fetchServiceEntries error:', err);
      setError(err.message || 'Failed to fetch service entries');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, guard?.community_id, user?.id, status]);

  // Update service entry status (check-in/out, approve/reject)
  const updateServiceStatus = async (entryId, newStatus, guardNotes = null) => {
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
      fetchServiceEntries();
    } catch (err) {
      console.error('updateServiceStatus error:', err);
      setError(err.message || 'Failed to update service status');
    }
  };

  // Create walk-in service entry (following delivery pattern exactly)
  const createServiceEntry = async (serviceEntryData) => {
    if (!isAuthenticated || !guard?.id || !user?.id) {
      const errorMsg = 'Guard authentication required';
      console.error('createServiceEntry failed:', errorMsg);
      setError(errorMsg);
      return null;
    }

    try {
      const fromDate = serviceEntryData.from_date || new Date().toISOString();
      const toDate =
        serviceEntryData.to_date ||
        new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
      const entryCode = generateVisitorEntryCode();
      const visitorPassToken = createVisitorPassToken();
      const qrCodeData = buildVisitorQrPayload({
        token: visitorPassToken,
        entryCode,
        visitorName: serviceEntryData.service_provider_name,
        visitorPhone: serviceEntryData.provider_phone || '',
        unitId: serviceEntryData.unit_id,
        fromDate,
        toDate,
        createdBy: user.id,
        purpose: serviceEntryData.service_purpose || 'Service request',
        visitorType: 'service',
        companyName: serviceEntryData.company_name || null,
        serviceType: serviceEntryData.service_type || null,
        vehicleType: 'service',
        driverName: serviceEntryData.service_provider_name || null,
        deliveryDetails: serviceEntryData.service_purpose || null,
      });

      // Professional service entry data structure (following delivery/cab pattern)
      const servicePassData = {
        visitor_name: serviceEntryData.service_provider_name,     // Service provider name as visitor name
        visitor_phone: serviceEntryData.provider_phone || '',     // Provider phone if available
        unit_id: serviceEntryData.unit_id,                       // Selected unit
        purpose: serviceEntryData.service_purpose || 'Service request', // Service purpose
        from_date: fromDate,                   // Expected service time
        to_date: toDate,                       // Expected completion time
        entry_code: entryCode,
        qr_code_data: qrCodeData,
        
        // Service-specific fields
        company_name: serviceEntryData.company_name,             // Service company name
        service_type: serviceEntryData.service_type,             // Type of service (cleaning, repair, etc.)
        visitor_type: 'service',                                 // Entry type
        vehicle_type: 'service',                                 // Vehicle type for services
        
        // Auth context fields (Always include these)
        created_by: user.id,
        approved_by: user.id,
        community_id: guard.community_id,
        entry_method: 'walk_in',
        status: 'pending',
        
        // Guard notes
        guard_notes: serviceEntryData.guard_notes || `Service entry created by guard for ${serviceEntryData.service_type}`
      };

      const { data, error } = await supabase
        .from('visitor_passes')
        .insert([servicePassData])
        .select('id')
        .single();
        
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      fetchServiceEntries();
      return data?.id || null; // Return service entry ID
    } catch (err) {
      console.error('createServiceEntry error:', err);
      setError(err.message || 'Failed to create service entry');
      return null;
    }
  };

  // Get service entry details (for QR scan, etc)
  const getServiceEntryDetails = async (entryId) => {
    try {
      const { data, error } = await supabase
        .from('visitor_passes')
        .select('*')
        .eq('id', entryId)
        .eq('visitor_type', 'service')
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('getServiceEntryDetails error:', err);
      setError(err.message || 'Failed to get service entry details');
      return null;
    }
  };

  // Handle real-time updates for service entries
  const handleRealtimeUpdate = useCallback((updatedEntry) => {
    if (!updatedEntry || updatedEntry.visitor_type !== 'service') return;
    
    setServiceEntries(prevEntries => {
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

  // Real-time subscription for service entries (scoped to guard's society)
  useEffect(() => {
    if (!isAuthenticated || !guard?.community_id || !user?.id) return;
    
    fetchServiceEntries();
    
    // Create unique channel name to avoid conflicts
    const timestamp = Date.now();
    const channelName = `service_entries_${guard.community_id}_${user.id}_${status || 'all'}_${timestamp}`;
    
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
          // Only update if it's a service entry
          if (payload.new?.visitor_type === 'service' || payload.old?.visitor_type === 'service') {
            handleRealtimeUpdate(payload.new);
          }
        })
        .subscribe();
    } catch (error) {
      console.warn('Service entry subscription error (non-critical):', error);
    }
      
    return () => {
      if (subscription) {
        try {
          supabase.removeChannel(subscription);
        } catch (error) {
          console.warn('Service entry unsubscribe error (non-critical):', error);
        }
      }
    };
  }, [isAuthenticated, guard?.community_id, user?.id, status, handleRealtimeUpdate]);

  return {
    serviceEntries,
    loading,
    error,
    updateServiceStatus,
    createServiceEntry,
    getServiceEntryDetails,
    fetchServiceEntries,
  };
};
