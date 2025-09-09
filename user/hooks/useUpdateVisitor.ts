import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

interface UpdateVisitorData {
  id: string;
  guestName?: string;
  phoneNumber?: string;
  visitDate?: string;
  sendGatePassNotification?: boolean;
  status?: string;
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
}

export const useUpdateVisitor = () => {
  const queryClient = useQueryClient();

  return useMutation<VisitorPass, Error, UpdateVisitorData>({
    mutationFn: async (visitorData) => {
      const { id, ...updateData } = visitorData;
      
      // Convert form data to database format
      const dbUpdateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updateData.guestName !== undefined) {
        dbUpdateData.visitor_name = updateData.guestName;
      }
      if (updateData.phoneNumber !== undefined) {
        dbUpdateData.visitor_phone = updateData.phoneNumber;
      }
      if (updateData.visitDate !== undefined) {
        dbUpdateData.visit_date = updateData.visitDate;
      }
      if (updateData.sendGatePassNotification !== undefined) {
        dbUpdateData.send_gate_pass_notification = updateData.sendGatePassNotification;
      }
      if (updateData.status !== undefined) {
        dbUpdateData.status = updateData.status;
      }

      const { data, error } = await supabase
        .from('visitor_passes')
        .update(dbUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch visitor passes
      queryClient.invalidateQueries({ queryKey: ['visitor-passes'] });
    },
  });
};
