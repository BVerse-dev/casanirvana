import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useGuardAuth } from '../contexts/GuardAuthContext';
import {
  buildVisitorQrPayload,
  createVisitorPassToken,
  generateVisitorEntryCode,
} from '../services/visitorPassArtifacts';

const HOST_ROLE_PRIORITY = [
  'user',
  'member',
  'resident',
  'committee',
  'committee_member',
  'admin',
  'superadmin',
];

const normalizeRole = (role) => String(role || '').toLowerCase();

const pickHostProfile = (profiles) => {
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return null;
  }

  const sorted = [...profiles].sort((a, b) => {
    const roleA = normalizeRole(a.role);
    const roleB = normalizeRole(b.role);
    const indexA = HOST_ROLE_PRIORITY.indexOf(roleA);
    const indexB = HOST_ROLE_PRIORITY.indexOf(roleB);
    const safeA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const safeB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
    return safeA - safeB;
  });

  return sorted[0];
};

const buildHostDisplay = (profile) => {
  if (!profile) return null;
  const fullName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  return {
    id: profile.id,
    full_name: fullName || 'Resident',
    phone: profile.phone || null,
    role: profile.role || null,
  };
};

const resolveHostByUnit = async ({ passesData, communityId }) => {
  const unitIds = [
    ...new Set(
      (passesData || [])
        .map((pass) => pass?.unit_id)
        .filter(Boolean)
    ),
  ];

  if (unitIds.length === 0) {
    return {};
  }

  const { data: profileRows, error: profileError } = await supabase
    .from('profiles')
    .select('id, unit_id, role, full_name, first_name, last_name, phone, community_id')
    .eq('community_id', communityId)
    .in('unit_id', unitIds);

  if (profileError) {
    throw profileError;
  }

  const profilesByUnit = (profileRows || []).reduce((acc, row) => {
    if (!acc[row.unit_id]) {
      acc[row.unit_id] = [];
    }
    acc[row.unit_id].push(row);
    return acc;
  }, {});

  const hostByUnit = {};
  unitIds.forEach((unitId) => {
    hostByUnit[unitId] = buildHostDisplay(pickHostProfile(profilesByUnit[unitId]));
  });

  return hostByUnit;
};

const applyStatusOrdering = (query, status) => {
  if (status === 'checked_in') {
    return query
      .order('actual_entry_time', { ascending: false, nullsFirst: false })
      .order('checked_in_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
  }

  if (status === 'checked_out') {
    return query
      .order('actual_exit_time', { ascending: false, nullsFirst: false })
      .order('checked_out_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
  }

  return query.order('created_at', { ascending: false });
};

export const useVisitorPasses = (status = null) => {
  const { guard, user, isAuthenticated } = useGuardAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPasses = useCallback(async () => {
    if (!isAuthenticated || !guard?.community_id) {
      setPasses([]);
      setError(null);
      setLoading(false);
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
            unit_number
          )
        `)
        .eq('community_id', guard.community_id);

      if (status === 'checked_in') {
        query = query
          .eq('status', 'checked_in')
          .is('actual_exit_time', null)
          .is('checked_out_at', null);
      } else if (status === 'checked_out') {
        query = query.or('status.eq.checked_out,actual_exit_time.not.is.null,checked_out_at.not.is.null');
      } else if (status) {
        query = query.eq('status', status);
      }

      query = applyStatusOrdering(query, status);

      const { data: passesData, error: passesError } = await query;
      if (passesError) {
        throw passesError;
      }

      const hostByUnit = await resolveHostByUnit({
        passesData,
        communityId: guard.community_id,
      });

      const normalizedPasses = (passesData || []).map((pass) => ({
        ...pass,
        host_resident: pass.unit_id ? hostByUnit[pass.unit_id] || null : null,
      }));

      setPasses(normalizedPasses);
    } catch (err) {
      setError(err?.message || 'Failed to fetch visitor passes');
    } finally {
      setLoading(false);
    }
  }, [guard?.community_id, isAuthenticated, status]);

  const updatePassStatus = async (passId, newStatus, guardNotes = null) => {
    if (!isAuthenticated || !guard?.community_id || !user?.id) {
      const authError = new Error('Guard authentication required');
      setError(authError.message);
      throw authError;
    }

    try {
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (guardNotes) {
        updateData.guard_notes = guardNotes;
      }

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

      const { error: updateError } = await supabase
        .from('visitor_passes')
        .update(updateData)
        .eq('id', passId)
        .eq('community_id', guard.community_id);

      if (updateError) {
        throw updateError;
      }

      await fetchPasses();
      return true;
    } catch (err) {
      setError(err?.message || 'Failed to update pass status');
      throw err;
    }
  };

  const createVisitorPass = async (entryData) => {
    if (!isAuthenticated || !guard?.id || !user?.id) {
      const errorMsg = 'Guard authentication required';
      setError(errorMsg);
      return null;
    }

    try {
      const fromDate = entryData.from_date || new Date().toISOString();
      const toDate =
        entryData.to_date ||
        new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
      const entryCode = generateVisitorEntryCode();
      const visitorPassToken = createVisitorPassToken();
      const qrCodeData = buildVisitorQrPayload({
        token: visitorPassToken,
        entryCode,
        visitorName: entryData.visitor_name,
        visitorPhone: entryData.visitor_phone,
        unitId: entryData.unit_id,
        fromDate,
        toDate,
        createdBy: user.id,
        purpose: entryData.purpose || 'Guest visit',
        visitorType: entryData.visitor_type || 'guest',
        companyName: entryData.company_name || null,
        serviceType: entryData.service_type || null,
        vehicleType: entryData.vehicle_type || null,
        vehicleNumber: entryData.vehicle_number || null,
        driverName: entryData.driver_name || null,
        deliveryDetails: entryData.delivery_details || null,
      });

      const visitorPassData = {
        ...entryData,
        from_date: fromDate,
        to_date: toDate,
        entry_code: entryCode,
        qr_code_data: qrCodeData,
        created_by: user.id,
        approved_by: user.id,
        community_id: guard.community_id,
        entry_method: 'walk_in',
        status: 'pending',
      };

      const { data, error: insertError } = await supabase
        .from('visitor_passes')
        .insert([visitorPassData])
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

      await fetchPasses();
      return data?.id || null;
    } catch (err) {
      setError(err?.message || 'Failed to create visitor pass');
      return null;
    }
  };

  const getPassDetails = async (passId) => {
    try {
      const { data, error: detailError } = await supabase
        .from('visitor_passes')
        .select(`
          *,
          units (
            id,
            block,
            number,
            unit_number
          )
        `)
        .eq('id', passId)
        .single();

      if (detailError) {
        throw detailError;
      }

      return data;
    } catch (err) {
      setError(err?.message || 'Failed to get pass details');
      return null;
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !guard?.community_id || !user?.id) {
      return undefined;
    }

    fetchPasses();

    const channelName = `visitor_passes_${guard.community_id}_${user.id}_${status || 'all'}_${Date.now()}`;

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visitor_passes',
          filter: `community_id=eq.${guard.community_id}`,
        },
        () => {
          fetchPasses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchPasses, guard?.community_id, isAuthenticated, status, user?.id]);

  return {
    passes,
    loading,
    error,
    updatePassStatus,
    createVisitorPass,
    getPassDetails,
    fetchPasses,
  };
};
