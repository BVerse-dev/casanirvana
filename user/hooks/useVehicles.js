import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Hook to list vehicles for a user
export const useListVehicles = (userId) => {
  return useQuery({
    queryKey: ['vehicles', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

// Hook to create a new vehicle
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vehicleData) => {
      // Generate unique vehicle ID for QR code
      const vehicleId = `VH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate entry code from vehicle ID (last 8 characters)
      const entryCode = vehicleId.slice(-8).toUpperCase();

      // Generate unique QR code data with vehicle information
      const qrCodeData = JSON.stringify({
        id: vehicleId,
        vehicle_number: vehicleData.vehicle_number,
        model: vehicleData.model,
        color: vehicleData.color,
        user_id: vehicleData.user_id,
        type: 'vehicle',
        entry_code: entryCode,
        created_at: new Date().toISOString(),
        expires_at: null // Vehicles don't expire
      });
      
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          ...vehicleData,
          qr_code: qrCodeData,
          entry_code: entryCode,
          expires_at: null, // Vehicles don't expire
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['vehicles', variables.user_id]);
    },
  });
};

// Hook to update a vehicle
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['vehicles', data.user_id]);
    },
  });
};

// Hook to delete a vehicle
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, userId }) => {
      const { error } = await supabase
        .from('vehicles')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return { id };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['vehicles', variables.userId]);
    },
  });
};

// Hook to get a single vehicle
export const useGetVehicle = (id) => {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}; 