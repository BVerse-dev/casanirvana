import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreateVisitorData {
  guestName: string;
  phoneNumber: string;
  visitDate: string;
  sendGatePassNotification: boolean;
  unitId?: string;
  createdBy?: string;
  // Extended fields for different visitor types
  visitorType?: string;
  companyName?: string;
  serviceType?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  driverName?: string;
  deliveryDetails?: string;
  purpose?: string;
}

interface VisitorPass {
  id: string;
  unit_id: string | null;
  visitor_name: string;
  visitor_phone: string | null;
  visit_date: string | null;
  send_gate_pass_notification: boolean;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  qr_code_data: string | null;
  entry_code: string | null;
  // Extended fields for different visitor types
  visitor_type: string | null;
  company_name: string | null;
  service_type: string | null;
  vehicle_type: string | null;
  vehicle_number: string | null;
  driver_name: string | null;
  delivery_details: string | null;
  purpose: string | null;
}

export const useCreateVisitor = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation<VisitorPass, Error, CreateVisitorData>({
    mutationFn: async (visitorData) => {
      // Check if user is authenticated
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user has a unit
      if (!profile?.unit_id) {
        throw new Error('No unit found for user. Please contact admin.');
      }

      console.log('🔍 Using unit from profile:', {
        profile_unit_id: profile.unit_id,
        user_id: user.id
      });

      const userUnitId = profile.unit_id;

      // Generate unique visitor pass ID for QR code
      const visitorPassId = `VP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate entry code from visitor pass ID (last 8 characters)
      const entryCode = visitorPassId.slice(-8).toUpperCase();

      // Generate unique QR code data with visitor and visit information
      const qrCodeData = JSON.stringify({
        id: visitorPassId, // Use the generated visitor pass ID
        visitor_name: visitorData.guestName,
        visitor_phone: visitorData.phoneNumber,
        unit_id: visitorData.unitId || userUnitId,
        visit_date: visitorData.visitDate,
        from_date: new Date(visitorData.visitDate + 'T09:00:00Z').toISOString(),
        to_date: new Date(visitorData.visitDate + 'T18:00:00Z').toISOString(),
        created_by: user.id,
        created_at: new Date().toISOString(),
        purpose: visitorData.purpose || 'Guest Visit',
        type: 'visitor_pass',
        entry_code: entryCode, // Include entry code in QR data
        // Extended visitor type information
        visitor_type: visitorData.visitorType || 'guest',
        company_name: visitorData.companyName || null,
        service_type: visitorData.serviceType || null,
        vehicle_type: visitorData.vehicleType || null,
        vehicle_number: visitorData.vehicleNumber || null,
        driver_name: visitorData.driverName || null,
        delivery_details: visitorData.deliveryDetails || null
      });

      // Convert the form data to database format
      const dbData = {
        visitor_name: visitorData.guestName,
        visitor_phone: visitorData.phoneNumber,
        visit_date: visitorData.visitDate,
        send_gate_pass_notification: visitorData.sendGatePassNotification,
        unit_id: visitorData.unitId || userUnitId, // Use provided unitId or user's unit
        created_by: user.id, // Set created_by to current user
        // Set default time range (can be customized later)
        from_date: new Date(visitorData.visitDate + 'T09:00:00Z').toISOString(),
        to_date: new Date(visitorData.visitDate + 'T18:00:00Z').toISOString(),
        status: 'pending',
        qr_code_data: qrCodeData, // Store the QR code data
        entry_code: entryCode, // Store the entry code for guard verification
        // Extended fields for different visitor types
        visitor_type: visitorData.visitorType || 'guest',
        company_name: visitorData.companyName || null,
        service_type: visitorData.serviceType || null,
        vehicle_type: visitorData.vehicleType || null,
        vehicle_number: visitorData.vehicleNumber || null,
        driver_name: visitorData.driverName || null,
        delivery_details: visitorData.deliveryDetails || null,
        purpose: visitorData.purpose || 'Guest Visit'
      };

      console.log('🔍 Creating visitor with data:', {
        unit_id: dbData.unit_id,
        created_by: dbData.created_by,
        auth_uid: user.id,
        profile_unit_id: profile.unit_id
      });

      const { data, error } = await supabase
        .from('visitor_passes')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch visitor passes using predicate to catch all visitor-passes queries
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'visitor-passes'
      });
    },
  });
};
