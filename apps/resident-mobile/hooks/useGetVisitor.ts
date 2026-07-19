import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

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
  from_date: string;
  to_date: string;
  purpose: string | null;
  vehicle_number: string | null;
  qr_code_data: string | null;
}

export const useGetVisitor = (visitorId: string) => {
  return useQuery<VisitorPass, Error>({
    queryKey: ['visitor-pass', visitorId],
    queryFn: async () => {
      if (!visitorId) {
        throw new Error('Visitor ID is required');
      }

      const { data, error } = await supabase
        .from('visitor_passes')
        .select('*')
        .eq('id', visitorId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!visitorId, // Only run query if visitorId is provided
  });
};
