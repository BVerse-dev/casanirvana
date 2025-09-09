import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  visitor_type: string | null;
  company_name: string | null;
  service_type: string | null;
  vehicle_type: string | null;
  vehicle_number: string | null;
  driver_name: string | null;
  delivery_details: string | null;
  purpose: string | null;
  from_date: string;
  to_date: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
}

export const useListVisitors = () => {
  const { user, profile } = useAuth();

  return useQuery<VisitorPass[], Error>({
    queryKey: ['visitor-passes', user?.id, profile?.unit_id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!profile?.unit_id) {
        throw new Error('No unit found for user');
      }

      console.log('🔍 Fetching visitors for unit:', profile.unit_id);

      const { data, error } = await supabase
        .from('visitor_passes')
        .select('*')
        .eq('unit_id', profile.unit_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching visitors:', error);
        throw new Error(error.message);
      }

      console.log('✅ Fetched visitors:', data?.length || 0);
      return data || [];
    },
    enabled: !!user && !!profile?.unit_id,
    refetchOnWindowFocus: false,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};
