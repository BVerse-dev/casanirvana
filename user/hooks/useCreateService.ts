import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreateServiceData {
  serviceName: string;
  phoneNumber: string;
  serviceType: string;
  serviceTime?: string;
  serviceDetails?: string;
  visitDate: string;
  sendGatePassNotification: boolean;
}

export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  const mutation = useMutation({
    mutationFn: async (serviceData: CreateServiceData) => {
      console.log('🔥 useCreateService mutation called with:', serviceData);
      
      // Check if user is authenticated
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user has a unit
      if (!profile?.unit_id) {
        throw new Error('No unit found for user. Please contact admin.');
      }

      const userUnitId = profile.unit_id;

      // Generate unique visitor pass ID for QR code
      const visitorPassId = `VP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate entry code from visitor pass ID (last 8 characters)
      const entryCode = visitorPassId.slice(-8).toUpperCase();

      // Generate unique QR code data with visitor and visit information
      const qrCodeData = JSON.stringify({
        id: visitorPassId,
        visitor_name: serviceData.serviceName,
        visitor_phone: serviceData.phoneNumber,
        unit_id: userUnitId,
        visit_date: serviceData.visitDate,
        from_date: new Date(serviceData.visitDate + 'T09:00:00Z').toISOString(),
        to_date: new Date(serviceData.visitDate + 'T18:00:00Z').toISOString(),
        created_by: user.id,
        created_at: new Date().toISOString(),
        purpose: `${serviceData.serviceType} Service`,
        type: 'visitor_pass',
        entry_code: entryCode,
        visitor_type: 'service',
        service_type: serviceData.serviceType,
        delivery_details: serviceData.serviceDetails || null
      });

      // Convert the form data to database format
      const dbData = {
        visitor_name: serviceData.serviceName,
        visitor_phone: serviceData.phoneNumber,
        visit_date: serviceData.visitDate,
        send_gate_pass_notification: serviceData.sendGatePassNotification,
        unit_id: userUnitId,
        created_by: user.id,
        from_date: new Date(serviceData.visitDate + 'T09:00:00Z').toISOString(),
        to_date: new Date(serviceData.visitDate + 'T18:00:00Z').toISOString(),
        status: 'pending',
        qr_code_data: qrCodeData,
        entry_code: entryCode,
        visitor_type: 'service',
        service_type: serviceData.serviceType,
        delivery_details: serviceData.serviceDetails || null,
        purpose: `${serviceData.serviceType} Service`
      };

      console.log('🔥 Creating service with data:', dbData);

      const { data, error } = await supabase
        .from('visitor_passes')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('🔥 Supabase error:', error);
        throw new Error(error.message);
      }

      console.log('🔥 Service created successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch visitor passes using predicate to catch all visitor-passes queries
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'visitor-passes'
      });
    },
  });

  return {
    ...mutation,
    createService: mutation.mutateAsync, // Keep this for compatibility
    isLoading: mutation.isPending,
  };
};
