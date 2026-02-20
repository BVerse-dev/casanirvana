import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface StaffMember {
  id: string;
  community_id: string;
  community_name: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  department: 'security' | 'housekeeping' | 'maintenance' | 'administration' | 'management' | 'gardening' | 'reception' | 'it';
  position: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern';
  shift: 'day' | 'night' | 'rotating' | 'flexible';
  joining_date: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  emergency_contact_name: string;
  emergency_contact_phone: string;
  address: string;
  photo_url?: string;
  documents_uploaded: boolean;
  documents_verified: {
    id_proof: boolean;
    address_proof: boolean;
    police_verification: boolean;
    medical_certificate: boolean;
    educational_certificate: boolean;
  };
  background_check_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  training_completed: boolean;
  certification_expiry?: string;
  performance_rating: number;
  attendance_percentage: number;
  last_performance_review?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useListStaff = () => {
  return useQuery({
    queryKey: ['community_staff'],
    queryFn: async (): Promise<StaffMember[]> => {
      console.log('🔍 useListStaff: Starting query...');
      
      const { data, error } = await supabase
        .from('community_staff' as any)
        .select(`
          *,
          communities!inner(
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useListStaff: Error fetching staff:', error);
        throw new Error(`Failed to fetch staff: ${error.message}`);
      }

      console.log('✅ useListStaff: Data fetched successfully:', data?.length, 'records');
      
      // Map the joined community name
      const staffWithCommunityName = (data || []).map((staff: any) => ({
        ...staff,
        community_name: staff.communities?.name || 'Unknown Community'
      }));
      
      return staffWithCommunityName as StaffMember[];
    },
  });
}; 