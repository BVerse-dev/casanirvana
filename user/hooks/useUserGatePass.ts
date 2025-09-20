import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Hook to get user's gate pass data
export const useUserGatePass = () => {
  return useQuery({
    queryKey: ['user-gate-pass'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, qr_code_data, entry_code, society_id, unit_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      console.log('🎫 useUserGatePass - Retrieved data:', data);
      console.log('🎫 useUserGatePass - QR code data:', data?.qr_code_data);

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to generate user gate pass (called when user gets approved)
export const useGenerateUserGatePass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Generate unique user gate pass ID
      const userGatePassId = `UP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate entry code from user gate pass ID (last 8 characters)
      const entryCode = userGatePassId.slice(-8).toUpperCase();

      // Get user profile data with unit and society information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          full_name, 
          email, 
          community_id, 
          unit_id,
          units!profiles_unit_id_fkey(block, number),
          communities!profiles_society_id_fkey(name)
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Generate unique QR code data with user information including unit details
      const qrCodeData = JSON.stringify({
        id: userGatePassId,
        name: profile.full_name,
        email: profile.email,
        community_id: profile.community_id,
        unit_id: profile.unit_id,
        unit_block: profile.units?.[0]?.block,
        unit_number: profile.units?.[0]?.number,
        community_name: profile.communities?.[0]?.name,
        type: 'user_gate_pass',
        entry_code: entryCode,
        created_at: new Date().toISOString(),
        expires_at: null // User gate pass doesn't expire
      });

      // Update user profile with QR code and entry code
      const { data, error } = await supabase
        .from('profiles')
        .update({
          qr_code_data: qrCodeData,
          entry_code: entryCode
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate user gate pass query
      queryClient.invalidateQueries({ queryKey: ['user-gate-pass'] });
    },
  });
}; 