import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Hook to get user profile
export const useGetProfile = (userId) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          units (
            id,
            number,
            type,
            floor,
            building
          )
        `)
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Hook to list maintenance requests for a user (accepts profileId directly like complaints)
export const useListMaintenanceRequests = (profileId) => {
  return useQuery({
    queryKey: ['maintenance-requests', profileId],
    queryFn: async () => {
      console.log('🔍 useListMaintenanceRequests called with profileId:', profileId);
      
      try {
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
        
        console.log('🔍 Maintenance requests query result:', { 
          dataLength: data?.length || 0, 
          error: error?.message,
          firstItem: data?.[0]?.title,
          allTitles: data?.map(item => item.title) || []
        });
        
        if (error) {
          console.error('❌ Supabase error:', error);
          throw error;
        }
        
        return data || [];
      } catch (err) {
        console.error('❌ Hook error:', err);
        throw err;
      }
    },
    enabled: true, // Always enabled like complaints
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
};

// Hook to create a maintenance request
export const useCreateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestData) => {
      console.log('🔄 useCreateMaintenanceRequest - Starting insertion with data:', requestData);
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert([requestData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ useCreateMaintenanceRequest - Supabase error:', error);
        throw error;
      }
      
      console.log('✅ useCreateMaintenanceRequest - Successfully created:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🔄 useCreateMaintenanceRequest - Invalidating queries after success');
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    },
    onError: (error) => {
      console.error('❌ useCreateMaintenanceRequest - Mutation failed:', error);
    },
  });
};

// Hook to update a maintenance request
export const useUpdateMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      console.log('🔄 useUpdateMaintenanceRequest: Updating maintenance request:', { id, data });
      
      const { data: result, error } = await supabase
        .from('maintenance_requests')
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('❌ useUpdateMaintenanceRequest error:', error);
        throw error;
      }
      
      if (!result || result.length === 0) {
        console.error('❌ useUpdateMaintenanceRequest: No rows updated, ID might not exist:', id);
        throw new Error(`Maintenance request with ID ${id} not found`);
      }
      
      const updatedRecord = result[0];
      console.log('✅ useUpdateMaintenanceRequest: Successfully updated maintenance request:', { 
        id: updatedRecord?.id, 
        status: updatedRecord?.status 
      });
      
      return updatedRecord;
    },
    onSuccess: (result, variables) => {
      // Invalidate both the list and the specific item
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', variables.id] });
    },
  });
};

// Hook to get a specific maintenance request
export const useGetMaintenanceRequest = (requestId) => {
  console.log('🔍 useGetMaintenanceRequest: Hook called with:', { requestId, type: typeof requestId });
  
  return useQuery({
    queryKey: ['maintenance', requestId],
    enabled: !!requestId,
    queryFn: async () => {
      if (!requestId) throw new Error('Request ID is required');
      
      // Convert to integer for database query
      const numericId = parseInt(requestId);
      if (isNaN(numericId)) {
        console.error('❌ useGetMaintenanceRequest: Invalid numeric ID:', numericId);
        throw new Error('Invalid request ID format');
      }
      
      console.log('🔍 useGetMaintenanceRequest: Fetching maintenance request with ID:', { requestId, numericId });
      
      console.log('🔍 useGetMaintenanceRequest: Executing Supabase query for ID:', numericId);
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          units (
            id,
            number,
            type,
            floor,
            building,
            residents (
              profiles (
                id,
                first_name,
                last_name,
                full_name
              )
            )
          ),
          requested_by_profile:profiles!requested_by (
            id,
            first_name,
            last_name,
            full_name,
            phone,
            email
          ),
          assigned_to_profile:profiles!assigned_to (
            id,
            first_name,
            last_name,
            full_name,
            phone,
            email
          )
        `)
        .eq('id', numericId)
        .single();
      
      console.log('🔍 useGetMaintenanceRequest: Query result:', { 
        hasData: !!data, 
        hasError: !!error, 
        errorMessage: error?.message,
        dataId: data?.id,
        dataStatus: data?.status
      });
      
      if (error) {
        console.error('❌ useGetMaintenanceRequest error:', error);
        throw error;
      }
      
      console.log('✅ useGetMaintenanceRequest: Successfully fetched maintenance request:', { 
        id: data?.id, 
        title: data?.title, 
        status: data?.status 
      });
      
      return data;
    },
    enabled: !!requestId,
  });
};

// Hook to delete a maintenance request
export const useDeleteMaintenanceRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestId) => {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', requestId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    },
  });
};

// Hook to get user's unit information
export const useGetUserUnit = (userId) => {
  return useQuery({
    queryKey: ['user-unit', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      
      // First get the user's profile to check if they have a unit assigned
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('unit_id')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      if (!profile?.unit_id) {
        // If no unit in profile, check residents table
        const { data: resident, error: residentError } = await supabase
          .from('residents')
          .select(`
            unit_id,
            units (
              id,
              number,
              type,
              floor,
              building
            )
          `)
          .eq('profile_id', userId)
          .single();
          
        if (residentError && residentError.code !== 'PGRST116') throw residentError;
        
        return resident?.units || null;
      }
      
      // Get unit details from units table
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select('*')
        .eq('id', profile.unit_id)
        .single();
        
      if (unitError) throw unitError;
      return unit;
    },
    enabled: !!userId,
  });
};

// Hook to list all maintenance requests (for admin/management)
export const useListAllMaintenanceRequests = () => {
  return useQuery({
    queryKey: ['all-maintenance-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          units (
            id,
            number,
            type,
            floor,
            building
          ),
          requested_by_profile:profiles!requested_by (
            id,
            first_name,
            last_name,
            full_name
          ),
          assigned_to_profile:profiles!assigned_to (
            id,
            first_name,
            last_name,
            full_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

// Hook to list maintenance comments
export const useListMaintenanceComments = (maintenanceId) => {
  return useQuery({
    queryKey: ['maintenance-comments', maintenanceId],
    queryFn: async () => {
      if (!maintenanceId) throw new Error('Maintenance ID is required');
      
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
            avatar_url
          )
        `)
        .eq('maintenance_id', maintenanceId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!maintenanceId,
  });
};

// Hook to create a maintenance comment
export const useCreateMaintenanceComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (commentData) => {
      const { data, error } = await supabase
        .from('maintenance_comments')
        .insert([commentData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-comments'] });
    },
  });
};

// ==================== PAYMENT HOOKS ====================

// Hook to list pending payments for a user
export const useListPendingPayments = (profileId) => {
  return useQuery({
    queryKey: ['pending-payments', profileId],
    queryFn: async () => {
      if (!profileId) {
        console.log('❌ useListPendingPayments: Missing profileId');
        return [];
      }
      
      // First get the user's profile to find their unit_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('unit_id')
        .eq('id', profileId)
        .single();
      
      if (profileError || !profile?.unit_id) {
        console.log('❌ useListPendingPayments: Could not find unit_id for profile', profileId);
        return [];
      }
      
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          units (
            id,
            number,
            type,
            floor,
            building
          )
        `)
        .eq('unit_id', profile.unit_id)
        .eq('status', 'pending')
        .order('due_date', { ascending: true });
      
      if (error) {
        console.error('❌ useListPendingPayments error:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!profileId,
  });
};

// Hook to list payment history for a user
export const useListPaymentHistory = (profileId) => {
  return useQuery({
    queryKey: ['payment-history', profileId],
    queryFn: async () => {
      if (!profileId) {
        console.log('❌ useListPaymentHistory: Missing profileId');
        return [];
      }
      
      // First get the user's profile to find their unit_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('unit_id')
        .eq('id', profileId)
        .single();
      
      if (profileError || !profile?.unit_id) {
        console.log('❌ useListPaymentHistory: Could not find unit_id for profile', profileId);
        return [];
      }
      
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          units (
            id,
            number,
            type,
            floor,
            building
          )
        `)
        .eq('unit_id', profile.unit_id)
        .eq('status', 'completed')
        .order('paid_at', { ascending: false });
      
      if (error) {
        console.error('❌ useListPaymentHistory error:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!profileId,
  });
};

// Hook to list payment statements for a user
export const useListPaymentStatements = (profileId) => {
  return useQuery({
    queryKey: ['payment-statements', profileId],
    queryFn: async () => {
      if (!profileId) {
        console.log('❌ useListPaymentStatements: Missing profileId');
        return [];
      }
      
      // First get the user's profile to find their unit_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('unit_id')
        .eq('id', profileId)
        .single();
      
      if (profileError || !profile?.unit_id) {
        console.log('❌ useListPaymentStatements: Could not find unit_id for profile', profileId);
        return [];
      }
      
      const { data, error } = await supabase
        .from('payment_statements')
        .select('*')
        .eq('unit_id', profile.unit_id)
        .order('month_year', { ascending: false });
      
      if (error) {
        console.error('❌ useListPaymentStatements error:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!profileId,
  });
};

// Hook to download payment receipt
export const useDownloadPaymentReceipt = () => {
  return useMutation({
    mutationFn: async (payment) => {
      if (!payment.receipt_url) {
        throw new Error('No receipt available for this payment');
      }
      
      // In a real app, you would download the file from the URL
      // For now, we'll simulate the download
      console.log(`📄 Downloading receipt for payment ${payment.id} from: ${payment.receipt_url}`);
      
      return { success: true, url: payment.receipt_url };
    },
  });
};

// Hook to download payment statement
export const useDownloadPaymentStatement = () => {
  return useMutation({
    mutationFn: async (statement) => {
      if (!statement.statement_url) {
        throw new Error('No statement PDF available');
      }
      
      // In a real app, you would download the file from the URL
      // For now, we'll simulate the download
      console.log(`📄 Downloading statement for ${statement.month_year} from: ${statement.statement_url}`);
      
      return { success: true, url: statement.statement_url };
    },
  });
};

// Hook to update payment
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('payments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
    },
  });
};
