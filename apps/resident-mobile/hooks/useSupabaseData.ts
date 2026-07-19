import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { Database, Tables, TablesInsert, TablesUpdate } from '../types/database.types';
import { uploadImageToSupabase } from '../utils/imageUpload';
import { getProfileByAuthId } from '../utils/profileResolver';

// Generic hooks for common operations
export const useListData = <T extends keyof Database['public']['Tables']>(
  table: T,
  queryKey: (string | undefined)[],
  filters?: { column: string; value: any; operator?: string }[]
) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from(table).select('*');
      
      if (filters) {
        filters.forEach(filter => {
          const operator = filter.operator || 'eq';
          query = query.filter(filter.column, operator, filter.value);
        });
      }
      
      // Add ordering by created_at in descending order (newest first)
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Tables<T>[];
    },
  });
};

export const useGetData = <T extends keyof Database['public']['Tables']>(
  table: T,
  id: string,
  queryKey: string[],
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Tables<T>;
    },
    enabled: options?.enabled !== false && !!id,
  });
};

export const useCreateData = <T extends keyof Database['public']['Tables']>(
  table: T,
  queryKey: string[]
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TablesInsert<T>) => {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useUpdateData = <T extends keyof Database['public']['Tables']>(
  table: T,
  queryKey: string[]
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TablesUpdate<T> }) => {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useDeleteData = <T extends keyof Database['public']['Tables']>(
  table: T,
  queryKey: string[]
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

// Visitor passes hooks
export const useVisitorPasses = (unitId?: string) => {
  return useQuery({
    queryKey: ['visitor-passes', unitId],
    queryFn: async () => {
      let query = supabase.from('visitor_passes').select('*');

      if (unitId) {
        query = query.eq('unit_id', unitId);
      }

      // Order by most recent first
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!unitId,
  });
};

export const useGetVisitorPass = (id: string) => {
  return useGetData('visitor_passes', id, ['visitor-pass', id]);
};

export const useCreateVisitorPass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visitorData: TablesInsert<'visitor_passes'>) => {
      const { data, error } = await supabase
        .from('visitor_passes')
        .insert(visitorData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visitor-passes'] });
      queryClient.invalidateQueries({ queryKey: ['visitor-passes', variables.unit_id] });
    },
  });
};

export const useUpdateVisitorPass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TablesUpdate<'visitor_passes'> }) => {
      const { data: result, error } = await supabase
        .from('visitor_passes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['visitor-passes'] });
      queryClient.invalidateQueries({ queryKey: ['visitor-passes', result.unit_id] });
      queryClient.invalidateQueries({ queryKey: ['visitor-pass', result.id] });
    },
  });
};

export const useDeleteVisitorPass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First get the visitor pass to have the unit_id for cache invalidation
      const { data: visitorPass } = await supabase
        .from('visitor_passes')
        .select('unit_id')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('visitor_passes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return visitorPass;
    },
    onSuccess: (visitorPass) => {
      queryClient.invalidateQueries({ queryKey: ['visitor-passes'] });
      if (visitorPass?.unit_id) {
        queryClient.invalidateQueries({ queryKey: ['visitor-passes', visitorPass.unit_id] });
      }
    },
  });
};

// Specific hooks for user-app entities
export const useListVisitorPasses = (unitId?: string) => {
  const filters = unitId ? [{ column: 'unit_id', value: unitId }] : undefined;
  return useListData('visitor_passes', ['visitor-passes', unitId], filters);
};

export const useListMaintenanceRequests = (profileId?: string) => {
  return useQuery({
    queryKey: ['maintenance-requests', profileId],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_requests')
        .select(`
          *,
          units (
            id,
            number,
            type,
            block
          ),
          requested_by_profile:profiles!requested_by (
            id,
            first_name,
            last_name,
            full_name,
            email
          ),
          assigned_to_profile:profiles!assigned_to (
            id,
            first_name,
            last_name,
            full_name,
            email
          )
        `);

      // Show user's own maintenance requests
      if (profileId) {
        query = query.eq('requested_by', profileId);
      } else {
        // No profile ID provided, return empty array
        return [];
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: true, // Always enabled like complaints
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
};

export const useCreateMaintenanceRequest = () => {
  return useCreateData('maintenance_requests', ['maintenance-requests']);
};

export const useCreateMaintenanceRequestWithImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      maintenanceData: TablesInsert<'maintenance_requests'> & {
        imageUris?: string[];
        storageOwnerId?: string;
      }
    ) => {
      try {
        let imageUrls: string[] = [];
        const now = Date.now();
        const ownerFolder = maintenanceData.storageOwnerId || maintenanceData.requested_by;

        if (maintenanceData.imageUris && maintenanceData.imageUris.length > 0) {
          const uploadPromises = maintenanceData.imageUris.map((uri, index) => {
            const extension = uri.split('.').pop() || 'jpg';
            const fileName = `${ownerFolder}/maintenance_${now}_${index}_${Math.random()
              .toString(36)
              .slice(2, 8)}.${extension}`;
            return uploadImageToSupabase(uri, 'attachments', fileName);
          });

          imageUrls = await Promise.all(uploadPromises);
        }

        const { imageUris, storageOwnerId, ...dbData } = maintenanceData;
        const payload: TablesInsert<'maintenance_requests'> = {
          ...dbData,
          images: imageUrls.length > 0 ? imageUrls : null,
        };

        const { data: result, error } = await supabase
          .from('maintenance_requests')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return result;
      } catch (error) {
        console.error('Error creating maintenance request with images:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
};

export const useUpdateMaintenanceRequest = () => {
  return useUpdateData('maintenance_requests', ['maintenance-requests']);
};

export const useGetMaintenanceRequest = (maintenanceId: string) => {
  // maintenance_requests.id is bigint
  const isValidId = (id: string) => {
    if (!id) return false;
    const intId = Number(id);
    return Number.isFinite(intId) && intId > 0;
  };

  return useQuery({
    queryKey: ['maintenance', maintenanceId],
    queryFn: async () => {
      const maintenanceIdInt = Number(maintenanceId);
      if (!Number.isFinite(maintenanceIdInt) || maintenanceIdInt <= 0) {
        throw new Error('Invalid maintenance ID');
      }

      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          requested_by_profile:profiles!requested_by (
            id,
            first_name,
            last_name,
            full_name,
            email
          ),
          resolved_by_profile:profiles!resolved_by_profile_id (
            id,
            first_name,
            last_name,
            full_name,
            email
          )
        `)
        .eq('id', maintenanceIdInt)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!maintenanceId && isValidId(maintenanceId),
  });
};

export const useListMaintenanceComments = (maintenanceId?: string) => {
  return useQuery({
    queryKey: ['maintenance-comments', maintenanceId],
    queryFn: async () => {
      if (!maintenanceId) throw new Error('Maintenance ID is required');
      
      // Convert maintenanceId to integer for BIGINT field comparison
      const maintenanceIdInt = parseInt(maintenanceId);
      if (isNaN(maintenanceIdInt)) {
        throw new Error('Invalid maintenance ID format');
      }
      
      const { data, error } = await supabase
        .from('maintenance_comments')
        .select(`
          *,
          created_by_profile:profiles!created_by (
            id,
            first_name,
            last_name,
            full_name,
            email,
            avatar_url,
            role,
            unit_id
          )
        `)
        .eq('maintenance_id', maintenanceIdInt)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Manual enrichment with units data
      if (data && data.length > 0) {
        // Get unique unit IDs from profiles
        const unitIds = [...new Set(
          data
            .map(comment => comment.created_by_profile?.unit_id)
            .filter(Boolean)
        )];
        
        // Fetch unit data
        let unitsMap: { [key: string]: any } = {};
        if (unitIds.length > 0) {
          const { data: units, error: unitsError } = await supabase
            .from('units')
            .select('id, number, block, type, floor')
            .in('id', unitIds);
          
          if (!unitsError && units) {
            units.forEach(unit => {
              unitsMap[unit.id] = unit;
            });
          }
        }
        
        // Enrich profiles with units data
        const enrichedData = data.map(comment => {
          if (comment.created_by_profile && comment.created_by_profile.unit_id) {
            (comment.created_by_profile as any).units = unitsMap[comment.created_by_profile.unit_id] || null;
          }
          return comment;
        });
        
        return enrichedData;
      }
      
      return data || [];
    },
    enabled: !!maintenanceId,
  });
};

export const useCreateMaintenanceComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (commentData: { maintenance_id: number; comment: string; created_by: string }) => {
      const { data, error } = await supabase
        .from('maintenance_comments')
        .insert([commentData])
        .select(`
          *,
          created_by_profile:profiles!created_by (
            id,
            first_name,
            last_name,
            full_name,
            email,
            avatar_url
          )
        `)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate comments for this specific maintenance request
      queryClient.invalidateQueries({ 
        queryKey: ['maintenance-comments', variables.maintenance_id.toString()] 
      });
      // Also invalidate all maintenance-comments queries as fallback
      queryClient.invalidateQueries({ queryKey: ['maintenance-comments'] });
    },
  });
};

// Complaints hooks
export const useListComplaints = (userId?: string) => {
  const filters = userId ? [{ column: 'raised_by', value: userId }] : undefined;
  return useListData('complaints', ['complaints', userId], filters);
};

// Separate hooks for personal and community complaints with profile information
export const useListPersonalComplaints = (userId?: string) => {
  return useQuery({
    queryKey: ['personal-complaints', userId],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('complaints')
        .select(`
          *,
          raised_by_profile:profiles!raised_by (
            id,
            user_id,
            first_name,
            last_name,
            avatar_url,
            email
          )
        `)
        .eq('complaint_type', 'personal');
      
      if (userId) {
        query = query.eq('raised_by', userId);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useListCommunityComplaints = (communityId?: string) => {
  return useQuery({
    queryKey: ['community-complaints', communityId],
    queryFn: async () => {
      if (!communityId) return [];

      const profileSelect = 'id, user_id, first_name, last_name, full_name, avatar_url, email';

      // Fetch community complaints with unit/community and direct profile relations.
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select(`
          *,
          units!inner (
            id,
            unit_number,
            community_id
          ),
          raised_by_profile:profiles!raised_by (${profileSelect}),
          created_by_profile:profiles!created_by_profile_id (${profileSelect})
        `)
        .eq('complaint_type', 'community')
        .eq('units.community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = complaints || [];
      const unresolvedCreatedByActors = Array.from(
        new Set(
          rows
            .filter(
              (complaint: any) =>
                !complaint.raised_by_profile &&
                !complaint.created_by_profile &&
                complaint.created_by
            )
            .map((complaint: any) => complaint.created_by)
        )
      );

      const fallbackProfilesByActor = new Map<string, any>();

      if (unresolvedCreatedByActors.length > 0) {
        const [profilesByIdResult, profilesByUserIdResult] = await Promise.all([
          supabase
            .from('profiles')
            .select(profileSelect)
            .in('id', unresolvedCreatedByActors),
          supabase
            .from('profiles')
            .select(profileSelect)
            .in('user_id', unresolvedCreatedByActors),
        ]);

        if (profilesByIdResult.error) throw profilesByIdResult.error;
        if (profilesByUserIdResult.error) throw profilesByUserIdResult.error;

        for (const profile of profilesByIdResult.data || []) {
          fallbackProfilesByActor.set(profile.id, profile);
        }
        for (const profile of profilesByUserIdResult.data || []) {
          if (profile.user_id) {
            fallbackProfilesByActor.set(profile.user_id, profile);
          }
          if (!fallbackProfilesByActor.has(profile.id)) {
            fallbackProfilesByActor.set(profile.id, profile);
          }
        }
      }

      return rows.map((complaint: any) => ({
        ...complaint,
        unit: complaint.units || null,
        profile:
          complaint.raised_by_profile ||
          complaint.created_by_profile ||
          fallbackProfilesByActor.get(complaint.created_by) ||
          null,
      }));
    },
    enabled: !!communityId,
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TablesInsert<'complaints'>) => {
      const { data: result, error } = await supabase
        .from('complaints')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      console.log('✅ Complaint created successfully (no image):', data);
      // Invalidate all complaint-related queries with pattern matching
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey;
        console.log('🔄 Invalidating query with key:', key);
        return key.includes('complaints') || 
               key.includes('personal-complaints') || 
               key.includes('community-complaints');
      }});
    },
  });
};

// Enhanced complaint creation hook with image upload support
export const useCreateComplaintWithImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (complaintData: TablesInsert<'complaints'> & { imageUris?: string[] }) => {
      try {
        let imageUrls: string[] = [];
        
        // If there are images, upload them first
        if (complaintData.imageUris && complaintData.imageUris.length > 0) {
          const uploadPromises = complaintData.imageUris.map(uri => uploadImageToSupabase(uri));
          imageUrls = await Promise.all(uploadPromises);
        }
        
        // Remove imageUris from the data before inserting
        const { imageUris, ...dbComplaintData } = complaintData;
        
        // Add image URLs to the complaints data
        const finalComplaintData = {
          ...dbComplaintData,
          images: imageUrls.length > 0 ? imageUrls : null
        };
        
        // Insert the complaint
        const { data: result, error } = await supabase
          .from('complaints')
          .insert(finalComplaintData)
          .select()
          .single();
          
        if (error) throw error;
        return result;
        
      } catch (error) {
        console.error('Error creating complaint with images:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Complaint with images created successfully:', data);
      // Invalidate all complaint-related queries with pattern matching
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey;
        console.log('🔄 Invalidating query with key:', key);
        return key.includes('complaints') || 
               key.includes('personal-complaints') || 
               key.includes('community-complaints');
      }});
    },
  });
};

export const useUpdateComplaint = () => {
  return useUpdateData('complaints', ['complaints']);
};

export const useGetComplaint = (complaintId: string) => {
  // Check if the complaintId is a valid UUID format
  const isValidUUID = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };
  
  return useQuery({
    queryKey: ['complaint', complaintId],
    queryFn: async () => {
      const { data: complaint, error } = await supabase
        .from('complaints')
        .select(`
          *,
          raised_by_profile:profiles!raised_by (
            id,
            user_id,
            first_name,
            last_name,
            full_name,
            email,
            avatar_url
          ),
          created_by_profile:profiles!created_by_profile_id (
            id,
            user_id,
            first_name,
            last_name,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('id', complaintId)
        .single();

      if (error) throw error;

      const directReporterProfile =
        complaint?.raised_by_profile ||
        complaint?.created_by_profile ||
        null;

      if (directReporterProfile) {
        return {
          ...complaint,
          reporter_profile: directReporterProfile,
        };
      }

      const candidateActorIds = Array.from(
        new Set(
          [complaint?.raised_by, complaint?.created_by, complaint?.created_by_profile_id].filter(Boolean)
        )
      );

      if (candidateActorIds.length === 0) {
        return {
          ...complaint,
          reporter_profile: null,
        };
      }

      const [profileByIdResult, profileByUserIdResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, user_id, first_name, last_name, full_name, email, avatar_url')
          .in('id', candidateActorIds),
        supabase
          .from('profiles')
          .select('id, user_id, first_name, last_name, full_name, email, avatar_url')
          .in('user_id', candidateActorIds),
      ]);

      if (profileByIdResult.error) throw profileByIdResult.error;
      if (profileByUserIdResult.error) throw profileByUserIdResult.error;

      const profileLookup = new Map<string, any>();
      for (const profile of profileByIdResult.data || []) {
        profileLookup.set(profile.id, profile);
      }
      for (const profile of profileByUserIdResult.data || []) {
        if (profile.user_id) profileLookup.set(profile.user_id, profile);
        if (!profileLookup.has(profile.id)) profileLookup.set(profile.id, profile);
      }

      const reporterProfile =
        profileLookup.get(complaint?.raised_by) ||
        profileLookup.get(complaint?.created_by_profile_id) ||
        profileLookup.get(complaint?.created_by) ||
        null;

      return {
        ...complaint,
        reporter_profile: reporterProfile,
      };
    },
    enabled: !!complaintId && isValidUUID(complaintId),
  });
};

// Comment hooks
export const useListComplaintComments = (complaintId?: string) => {
  return useQuery({
    queryKey: ['complaint-comments', complaintId],
    queryFn: async () => {
      // Use a raw SQL query to join auth.users with public.users via email
      const { data, error } = await supabase
        .rpc('get_complaint_comments_with_profiles', {
          complaint_uuid: complaintId
        });
      
      if (error) {
        console.error('Error fetching comments:', error);
        // Fallback to basic query without profile data
        const { data: basicData, error: basicError } = await supabase
          .from('complaint_comments')
          .select('*')
          .eq('complaint_id', complaintId)
          .order('created_at', { ascending: true });
        
        if (basicError) throw basicError;
        return basicData || [];
      }
      
      return data || [];
    },
    enabled: !!complaintId,
  });
};

export const useCreateComplaintComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TablesInsert<'complaint_comments'>) => {
      const { data: result, error } = await supabase
        .from('complaint_comments')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      // Invalidate comments for this complaint to trigger refetch
      queryClient.invalidateQueries({ 
        queryKey: ['complaint-comments', data.complaint_id] 
      });
    },
  });
};

export const useListAmenities = (communityId?: string) => {
  const filters = communityId ? [{ column: 'community_id', value: communityId }] : undefined;
  return useListData('amenities', ['amenities', communityId], filters);
};

export const useListAmenityBookings = (userId?: string) => {
  const filters = userId ? [{ column: 'user_id', value: userId }] : undefined;
  return useListData('amenity_bookings', ['amenity-bookings', userId], filters);
};

export const useCreateAmenityBooking = () => {
  return useCreateData('amenity_bookings', ['amenity-bookings']);
};

export const useUpdateAmenityBooking = () => {
  return useUpdateData('amenity_bookings', ['amenity-bookings']);
};

export const useListPayments = (unitId?: string) => {
  const filters = unitId ? [{ column: 'unit_id', value: unitId }] : undefined;
  return useListData('payments', ['payments', unitId], filters);
};

export const useUpdatePayment = () => {
  return useUpdateData('payments', ['payments']);
};

export const useListNotices = (communityId?: string) => {
  const filters = communityId ? [{ column: 'community_id', value: communityId }] : undefined;
  return useListData('notices', ['notices', communityId], filters);
};

export const useListEmergencyAlerts = (communityId?: string) => {
  const filters = communityId 
    ? [
        { column: 'community_id', value: communityId },
        { column: 'is_active', value: true }
      ] 
    : [{ column: 'is_active', value: true }];
  return useListData('emergency_alerts', ['emergency-alerts', communityId], filters);
};

export const useListMessages = (userId?: string) => {
  const filters = userId ? [{ column: 'recipient_id', value: userId }] : undefined;
  return useListData('messages', ['messages', userId], filters);
};

export const useCreateMessage = () => {
  return useCreateData('messages', ['messages']);
};

export const useUpdateMessage = () => {
  return useUpdateData('messages', ['messages']);
};

export const useGetProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      console.log('useGetProfile - Querying for userId (id/user_id fallback):', userId);
      const profile = await getProfileByAuthId(userId, '*');
      return (profile || null) as Tables<'profiles'> | null;
    },
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  return useUpdateData('profiles', ['profile']);
};

export const useGetUnit = (unitId: string) => {
  return useGetData('units', unitId, ['unit', unitId]);
};

export const useGetCommunity = (communityId: string) => {
  return useGetData('communities', communityId, ['community', communityId]);
};

// Hook to get user's unit information from their profile
export const useGetUserUnit = (userId?: string) => {
  return useQuery({
    queryKey: ['userUnit', userId],
    queryFn: async () => {
      if (!userId) return null;

      const profile = await getProfileByAuthId(
        userId,
        `
          unit_id,
          units (
            id,
            block,
            number,
            unit_number
          )
        `
      );

      return profile?.units || null;
    },
    enabled: !!userId,
  });
};
