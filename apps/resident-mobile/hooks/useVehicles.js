import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import {
  buildVehicleQrCode,
  createDirectoryEntryIdentity,
  resolveDirectoryEntryIdentity,
} from '../utils/directoryEntryQr';

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
      const createdAt = new Date().toISOString();
      const { entityId, entryCode } = createDirectoryEntryIdentity('VH');
      const qrCodeData = buildVehicleQrCode({
        entityId,
        entryCode,
        data: {
          ...vehicleData,
          created_at: createdAt,
        },
      });
      
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          ...vehicleData,
          qr_code: qrCodeData,
          entry_code: entryCode,
          expires_at: null,
          is_active: true,
          created_at: createdAt,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', variables.user_id] });
    },
  });
};

// Hook to update a vehicle
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data: existingData, error: existingError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (existingError) throw existingError;

      const mergedData = {
        ...existingData,
        ...updates,
      };
      const { entityId, entryCode } = resolveDirectoryEntryIdentity({
        prefix: 'VH',
        existingEntryCode: existingData.entry_code,
        existingQrCode: existingData.qr_code,
      });
      const qrCode = buildVehicleQrCode({
        entityId,
        entryCode,
        data: {
          ...mergedData,
          created_at: existingData.created_at,
        },
      });

      const { data, error } = await supabase
        .from('vehicles')
        .update({
          ...updates,
          entry_code: entryCode,
          qr_code: qrCode,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', data.user_id] });
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
      queryClient.invalidateQueries({ queryKey: ['vehicles', variables.userId] });
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
