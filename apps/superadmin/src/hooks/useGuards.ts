"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from "../lib/database.types";

// Enhanced Guard type with all profile fields
export type Guard = Database['public']['Tables']['guards']['Row'] & {
  // Relations (if queried)
  communities?: {
    id: string;
    name: string;
    address?: string;
  } | null;
  units?: {
    id: string;
    number: string;
    block: string;
  } | null;
};

// Form data type for guard creation/editing
export interface GuardFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  licenseNumber: string;
  employmentDate: string;
  shiftType: string;
  emergencyContact: string;
  emergencyName: string;
  salary: number;
  communityAssignment?: string;
  address: string;
  dateOfBirth: string;
  bloodGroup?: string;
  medicalConditions?: string;
  password?: string;
  sendWelcomeEmail: boolean;
}

// Transform form data to current database format
export const transformFormDataToDbFormat = (formData: GuardFormData): Database['public']['Tables']['guards']['Insert'] => {
  return {
    full_name: `${formData.firstName} ${formData.lastName}`,
    emergency_contact: formData.emergencyContact,
    employee_id: formData.licenseNumber, // Use license number as employee ID for now
    employment_date: formData.employmentDate,
    license_number: formData.licenseNumber,
    salary: formData.salary,
    shift_type: formData.shiftType,
    is_active: formData.status === 'active',
    // Note: Many fields will need to be added to database schema
    // For now, we'll store what we can in the existing structure
  };
};

// Transform database data to form format
export const transformDbDataToFormFormat = (dbData: Guard): GuardFormData => {
  const nameParts = dbData.full_name?.split(' ') || ['', ''];
  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: '', // Will need email column
    phone: '', // Will need phone column  
    status: dbData.is_active ? 'active' : 'inactive',
    licenseNumber: dbData.license_number || '',
    employmentDate: dbData.employment_date || '',
    shiftType: dbData.shift_type || 'day',
    emergencyContact: dbData.emergency_contact || '',
    emergencyName: '', // Will need emergency_contact_name column
    salary: dbData.salary || 0,
    communityAssignment: '', // Will need community_assignment column
    address: '', // Will need address column
    dateOfBirth: '', // Will need date_of_birth column
    bloodGroup: '', // Will need blood_group column
    medicalConditions: '', // Will need medical_conditions column
    password: '',
    sendWelcomeEmail: true,
  };
};

export type CreateGuardData = Database['public']['Tables']['guards']['Insert'];
export type UpdateGuardData = Partial<CreateGuardData>;

// List all guards with enhanced profile data
export const useListGuards = () => {
  return useQuery({
    queryKey: ['guards'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('guards')
          .select(`
            *,
            communities!guards_society_id_fkey (
              id,
              name,
              address
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching guards:', error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error('Failed to fetch guards:', error);
        return [];
      }
    },
  });
};

// Get single guard with full profile data
export const useGetGuard = (id: string) => {
  return useQuery({
    queryKey: ['guards', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('guards')
          .select(`
            *,
            communities!guards_society_id_fkey (
              id,
              name,
              address
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching guard:', error);
          throw new Error('Guard not found');
        }
        
        return data;
      } catch (error) {
        console.error('Failed to fetch guard:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Create new guard with form data
export const useCreateGuard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: GuardFormData) => {
      const guardData = transformFormDataToDbFormat(formData);
      
      const { data, error } = await supabase
        .from('guards')
        .insert(guardData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guards'] });
    },
  });
};

// Update guard with form data
export const useUpdateGuard = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: GuardFormData) => {
      const guardData = transformFormDataToDbFormat(formData);
      
      const { data, error } = await supabase
        .from('guards')
        .update({
          ...guardData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guards'] });
      queryClient.invalidateQueries({ queryKey: ['guards', id] });
    },
  });
};

// Delete guard
export const useDeleteGuard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guards'] });
    },
  });
};

// Update guard status
export const useUpdateGuardStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('guards')
        .update({ 
          status,
          is_active: status === 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guards'] });
    },
  });
};

// Get guards by community
export const useGuardsByCommunity = (communityId: string) => {
  return useQuery({
    queryKey: ['guards', 'community', communityId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('guards')
          .select(`
            *,
            communities!guards_society_id_fkey (
              id,
              name,
              address
            )
          `)
          .eq('community_id', communityId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching guards by community:', error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error('Failed to fetch guards by community:', error);
        return [];
      }
    },
    enabled: !!communityId,
  });
};

// Get guards statistics for dashboard (using existing schema)
export const useGuardsStats = () => {
  return useQuery({
    queryKey: ['guards', 'stats'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('guards')
          .select('is_active, shift_type, salary, employment_date');

        if (error) {
          console.error('Error fetching guards stats:', error);
          return {
            total: 0,
            active: 0,
            onDuty: 0,
            available: 0,
            byShiftType: {},
            averageRating: 0,
            averageExperience: 0,
          };
        }

        const { data: performanceData, error: performanceError } = await supabase
          .from('guard_performance')
          .select('overall_score');

        if (performanceError) {
          console.error('Error fetching guard performance stats:', performanceError);
        }

        const ratingValues = (performanceData || [])
          .map((performance) => Number(performance.overall_score) || 0)
          .filter((value) => value > 0);

        const averageRating = ratingValues.length > 0
          ? Number((ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length).toFixed(2))
          : 0;

        const today = new Date();
        const experienceValues = (data || [])
          .map((guard) => {
            if (!guard.employment_date) return 0;
            const employmentDate = new Date(guard.employment_date);
            if (Number.isNaN(employmentDate.getTime())) return 0;

            const diffMs = today.getTime() - employmentDate.getTime();
            return Math.max(0, diffMs / (1000 * 60 * 60 * 24 * 365.25));
          })
          .filter((value) => value > 0);

        const averageExperience = experienceValues.length > 0
          ? Number((experienceValues.reduce((sum, value) => sum + value, 0) / experienceValues.length).toFixed(1))
          : 0;

        const stats = {
          total: data.length,
          active: data.filter(g => g.is_active).length,
          onDuty: data.filter(g => g.is_active).length, // Using is_active as proxy for on duty
          available: data.filter(g => g.is_active).length,
          byShiftType: data.reduce((acc: any, guard) => {
            acc[guard.shift_type || 'unknown'] = (acc[guard.shift_type || 'unknown'] || 0) + 1;
            return acc;
          }, {}),
          averageRating,
          averageExperience,
        };

        return stats;
      } catch (error) {
        console.error('Failed to fetch guards stats:', error);
        return {
          total: 0,
          active: 0,
          onDuty: 0,
          available: 0,
          byShiftType: {},
          averageRating: 0,
          averageExperience: 0,
        };
      }
    },
  });
};
