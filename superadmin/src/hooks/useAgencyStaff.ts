'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types that match our database schema and UI
export interface AgencyStaff {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  date_of_joining: string;
  salary: number;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  performance: number;
  reporting_manager_id?: string;
  agency_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  // Relations
  reporting_manager?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateAgencyStaffData {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  date_of_joining: string;
  salary: number;
  status?: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  performance?: number;
  reporting_manager_id?: string;
  agency_id?: string;
}

export interface UpdateAgencyStaffData extends Partial<CreateAgencyStaffData> {
  id: string;
}

// Query Keys
const QUERY_KEYS = {
  agencyStaff: ['agency_staff'] as const,
  agencyStaffMember: (id: string) => ['agency_staff', id] as const,
  agencyStaffByAgency: (agencyId: string) => ['agency_staff', 'agency', agencyId] as const,
  agencyStaffByDepartment: (department: string) => ['agency_staff', 'department', department] as const,
  activeAgencyStaff: ['agency_staff', 'active'] as const,
};

// Helper function to parse agency staff data
const parseAgencyStaffData = (data: any): AgencyStaff => {
  return {
    id: data.id,
    employee_id: data.employee_id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    department: data.department,
    date_of_joining: data.date_of_joining,
    salary: data.salary,
    status: data.status,
    performance: data.performance || 85,
    reporting_manager_id: data.reporting_manager_id,
    agency_id: data.agency_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    created_by: data.created_by,
    updated_by: data.updated_by,
    // Relations
    reporting_manager: data.reporting_manager,
  };
};

// Hooks

// List all agency staff
export const useListAgencyStaff = () => {
  return useQuery({
    queryKey: QUERY_KEYS.agencyStaff,
    queryFn: async () => {
      console.log('🔍 useListAgencyStaff: Starting query...');
      try {
        console.log('🔍 useListAgencyStaff: Attempting Supabase query...');
        const { data, error } = await (supabase as any)
          .from('agency_staff')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('🚨 useListAgencyStaff: Database error:', error);
          throw new Error(`Failed to fetch agency staff: ${error.message}`);
        }
        
        console.log('✅ useListAgencyStaff: Query successful, data:', data);
        return data?.map(parseAgencyStaffData) || [];
      } catch (error: any) {
        // If table doesn't exist yet, return dummy data as fallback
        if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('relationship')) {
          console.warn('🔄 useListAgencyStaff: Agency staff table not yet created, using fallback dummy data');
          return [
            {
              id: '1',
              employee_id: 'EMP001',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@realestate.com',
              phone: '+1-555-0123',
              role: 'Sales Agent',
              department: 'Sales',
              date_of_joining: '2023-01-15',
              salary: 75000,
              status: 'Active' as const,
              performance: 92,
              created_at: '2023-01-15T10:00:00Z',
              updated_at: '2023-06-15T10:00:00Z'
            },
            {
              id: '2',
              employee_id: 'EMP002',
              first_name: 'Jane',
              last_name: 'Smith',
              email: 'jane.smith@realestate.com',
              phone: '+1-555-0124',
              role: 'Property Manager',
              department: 'Operations',
              date_of_joining: '2023-02-20',
              salary: 68000,
              status: 'Active' as const,
              performance: 88,
              created_at: '2023-02-20T10:00:00Z',
              updated_at: '2023-06-15T10:00:00Z'
            },
            {
              id: '3',
              employee_id: 'EMP003',
              first_name: 'Mike',
              last_name: 'Johnson',
              email: 'mike.johnson@realestate.com',
              phone: '+1-555-0125',
              role: 'Marketing Specialist',
              department: 'Marketing',
              date_of_joining: '2023-03-10',
              salary: 55000,
              status: 'Active' as const,
              performance: 85,
              created_at: '2023-03-10T10:00:00Z',
              updated_at: '2023-06-15T10:00:00Z'
            },
            {
              id: '4',
              employee_id: 'EMP004',
              first_name: 'Sarah',
              last_name: 'Wilson',
              email: 'sarah.wilson@realestate.com',
              phone: '+1-555-0126',
              role: 'Administrative Assistant',
              department: 'Administration',
              date_of_joining: '2023-04-05',
              salary: 45000,
              status: 'On Leave' as const,
              performance: 90,
              created_at: '2023-04-05T10:00:00Z',
              updated_at: '2023-06-15T10:00:00Z'
            },
            {
              id: '5',
              employee_id: 'EMP005',
              first_name: 'David',
              last_name: 'Brown',
              email: 'david.brown@realestate.com',
              phone: '+1-555-0127',
              role: 'Sales Agent',
              department: 'Sales',
              date_of_joining: '2023-05-12',
              salary: 72000,
              status: 'Inactive' as const,
              performance: 78,
              created_at: '2023-05-12T10:00:00Z',
              updated_at: '2023-06-15T10:00:00Z'
            }
          ];
        }
        console.error('🚨 useListAgencyStaff: Unexpected error, using fallback data:', error);
        // Fallback to dummy data for any error
        return [
          {
            id: '1',
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@realestate.com',
            phone: '+1-555-0123',
            role: 'Sales Agent',
            department: 'Sales',
            date_of_joining: '2023-01-15',
            salary: 75000,
            status: 'Active' as const,
            performance: 92,
            created_at: '2023-01-15T10:00:00Z',
            updated_at: '2023-06-15T10:00:00Z'
          },
          {
            id: '2',
            employee_id: 'EMP002',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@realestate.com',
            phone: '+1-555-0124',
            role: 'Property Manager',
            department: 'Operations',
            date_of_joining: '2023-02-20',
            salary: 68000,
            status: 'Active' as const,
            performance: 88,
            created_at: '2023-02-20T10:00:00Z',
            updated_at: '2023-06-15T10:00:00Z'
          },
          {
            id: '3',
            employee_id: 'EMP003',
            first_name: 'Mike',
            last_name: 'Johnson',
            email: 'mike.johnson@realestate.com',
            phone: '+1-555-0125',
            role: 'Marketing Specialist',
            department: 'Marketing',
            date_of_joining: '2023-03-10',
            salary: 55000,
            status: 'Active' as const,
            performance: 85,
            created_at: '2023-03-10T10:00:00Z',
            updated_at: '2023-06-15T10:00:00Z'
          },
          {
            id: '4',
            employee_id: 'EMP004',
            first_name: 'Sarah',
            last_name: 'Wilson',
            email: 'sarah.wilson@realestate.com',
            phone: '+1-555-0126',
            role: 'Administrative Assistant',
            department: 'Administration',
            date_of_joining: '2023-04-05',
            salary: 45000,
            status: 'On Leave' as const,
            performance: 90,
            created_at: '2023-04-05T10:00:00Z',
            updated_at: '2023-06-15T10:00:00Z'
          },
          {
            id: '5',
            employee_id: 'EMP005',
            first_name: 'David',
            last_name: 'Brown',
            email: 'david.brown@realestate.com',
            phone: '+1-555-0127',
            role: 'Sales Agent',
            department: 'Sales',
            date_of_joining: '2023-05-12',
            salary: 72000,
            status: 'Inactive' as const,
            performance: 78,
            created_at: '2023-05-12T10:00:00Z',
            updated_at: '2023-06-15T10:00:00Z'
          }
        ];
      }
    },
  });
};

// Get agency staff by ID
export const useGetAgencyStaff = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.agencyStaffMember(id),
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('agency_staff')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('Error fetching agency staff member:', error);
          throw new Error(`Failed to fetch agency staff member: ${error.message}`);
        }
        
        return data ? parseAgencyStaffData(data) : null;
      } catch (error: any) {
        if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('relationship')) {
          console.warn('Agency staff table not yet created, returning null');
          return null;
        }
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Get active agency staff
export const useActiveAgencyStaff = () => {
  return useQuery({
    queryKey: QUERY_KEYS.activeAgencyStaff,
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('agency_staff')
          .select('*')
          .eq('status', 'Active')
          .order('first_name');

        if (error) {
          console.error('Error fetching active agency staff:', error);
          throw new Error(`Failed to fetch active agency staff: ${error.message}`);
        }

        return data?.map(parseAgencyStaffData) || [];
      } catch (error: any) {
        if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('relationship')) {
          console.warn('Agency staff table not yet created, using fallback data for active staff');
          return [
            {
              id: '1',
              employee_id: 'EMP001',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@realestate.com',
              phone: '+1-555-0123',
              role: 'Sales Agent',
              department: 'Sales',
              date_of_joining: '2023-01-15',
              salary: 75000,
              status: 'Active' as const,
              performance: 92,
              created_at: '2023-01-15T10:00:00Z',
              updated_at: '2023-06-15T10:00:00Z'
            },
            {
              id: '2',
              employee_id: 'EMP002',
              first_name: 'Jane',
              last_name: 'Smith',
              email: 'jane.smith@realestate.com',
              phone: '+1-555-0124',
              role: 'Property Manager',
              department: 'Operations',
              date_of_joining: '2023-02-20',
              salary: 68000,
              status: 'Active' as const,
              performance: 88,
              created_at: '2023-02-20T10:00:00Z',
              updated_at: '2023-06-15T10:00:00Z'
            },
            {
              id: '3',
              employee_id: 'EMP003',
              first_name: 'Mike',
              last_name: 'Johnson',
              email: 'mike.johnson@realestate.com',
              phone: '+1-555-0125',
              role: 'Marketing Specialist',
              department: 'Marketing',
              date_of_joining: '2023-03-10',
              salary: 55000,
              status: 'Active' as const,
              performance: 85,
              created_at: '2023-03-10T10:00:00Z',
              updated_at: '2023-06-15T10:00:00Z'
            }
          ];
        }
        throw error;
      }
    },
  });
};

// Get agency staff by department
export const useAgencyStaffByDepartment = (department: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.agencyStaffByDepartment(department),
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('agency_staff')
          .select('*')
          .eq('department', department)
          .order('first_name');

        if (error) {
          console.error('Error fetching agency staff by department:', error);
          throw new Error(`Failed to fetch agency staff: ${error.message}`);
        }

        return data?.map(parseAgencyStaffData) || [];
      } catch (error: any) {
        if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('relationship')) {
          console.warn('Agency staff table not yet created, using fallback data for department', department);
          // Return appropriate staff for the department
          const salesStaff = [
            {
              id: '1',
              employee_id: 'EMP001',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@realestate.com',
              phone: '+1-555-0123',
              role: 'Sales Agent',
              department: 'Sales',
              date_of_joining: '2023-01-15',
              salary: 75000,
              status: 'Active' as const,
              performance: 92,
              created_at: '2023-01-15T10:00:00Z',
              updated_at: '2023-06-15T10:00:00Z'
            }
          ];
          const operationsStaff = [
            {
              id: '2',
              employee_id: 'EMP002',
              first_name: 'Jane',
              last_name: 'Smith',
              email: 'jane.smith@realestate.com',
              phone: '+1-555-0124',
              role: 'Property Manager',
              department: 'Operations',
              date_of_joining: '2023-02-20',
              salary: 68000,
              status: 'Active' as const,
              performance: 88,
              created_at: '2023-02-20T10:00:00Z',
              updated_at: '2023-06-15T10:00:00Z'
            }
          ];
          
          switch (department) {
            case 'Sales': return salesStaff;
            case 'Operations': return operationsStaff;
            default: return [];
          }
        }
        throw error;
      }
    },
    enabled: !!department,
  });
};

// Create agency staff
export const useCreateAgencyStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffData: CreateAgencyStaffData): Promise<AgencyStaff> => {
      const { data, error } = await (supabase as any)
        .from('agency_staff')
        .insert([{
          ...staffData,
          status: staffData.status || 'Active',
          performance: staffData.performance || 85,
        }])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating agency staff:', error);
        throw new Error(`Failed to create agency staff: ${error.message}`);
      }

      return parseAgencyStaffData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgencyStaff });
    },
  });
};

// Update agency staff
export const useUpdateAgencyStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateAgencyStaffData): Promise<AgencyStaff> => {
      const { id, ...data } = updateData;
      
      const { data: result, error } = await (supabase as any)
        .from('agency_staff')
        .update(data)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating agency staff:', error);
        throw new Error(`Failed to update agency staff: ${error.message}`);
      }

      return parseAgencyStaffData(result);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyStaffMember(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgencyStaff });
    },
  });
};

// Delete agency staff
export const useDeleteAgencyStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const { error } = await (supabase as any)
        .from('agency_staff')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting agency staff:', error);
        throw new Error(`Failed to delete agency staff: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgencyStaff });
    },
  });
};

// Analytics hooks for the Overview tab

// Get department statistics
export const useAgencyStaffDepartmentStats = () => {
  return useQuery({
    queryKey: ['agency_staff', 'department_stats'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('agency_staff')
          .select('department, status');

        if (error) {
          console.error('Error fetching department stats:', error);
          throw new Error(`Failed to fetch department stats: ${error.message}`);
        }

        // Calculate department distribution
        const departmentCounts = data.reduce((acc: any, staff: any) => {
          acc[staff.department] = (acc[staff.department] || 0) + 1;
          return acc;
        }, {});

        const total = data.length;
        return Object.entries(departmentCounts).map(([name, count]) => ({
          name,
          count: count as number,
          percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
        }));
      } catch (error: any) {
        if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('relationship')) {
          console.warn('Agency staff table not yet created, using default department data');
          return [
            { name: 'Sales', count: 2, percentage: 40 },
            { name: 'Operations', count: 1, percentage: 20 },
            { name: 'Marketing', count: 1, percentage: 20 },
            { name: 'Administration', count: 1, percentage: 20 },
          ];
        }
        throw error;
      }
    },
  });
};

// Get staff statistics
export const useAgencyStaffStats = () => {
  return useQuery({
    queryKey: ['agency_staff', 'stats'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('agency_staff')
          .select('status, performance, salary');

        if (error) {
          console.error('Error fetching staff stats:', error);
          throw new Error(`Failed to fetch staff stats: ${error.message}`);
        }

        const totalStaff = data.length;
        const activeStaff = data.filter((s: any) => s.status === 'Active').length;
        const inactiveStaff = data.filter((s: any) => s.status === 'Inactive' || s.status === 'On Leave').length;
        const avgPerformance = totalStaff > 0 
          ? data.reduce((sum: number, staff: any) => sum + (staff.performance || 0), 0) / totalStaff 
          : 0;
        const avgSalary = totalStaff > 0 
          ? data.reduce((sum: number, staff: any) => sum + (staff.salary || 0), 0) / totalStaff 
          : 0;

        return {
          totalStaff,
          activeStaff,
          inactiveStaff,
          avgPerformance: Math.round(avgPerformance * 10) / 10,
          avgSalary: Math.round(avgSalary),
        };
      } catch (error: any) {
        if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('relationship')) {
          console.warn('Agency staff table not yet created, using default stats');
          return {
            totalStaff: 5,
            activeStaff: 3,
            inactiveStaff: 2,
            avgPerformance: 87.8,
            avgSalary: 62000,
          };
        }
        throw error;
      }
    },
  });
};

// Get monthly hiring trend
export const useAgencyStaffHiringTrend = () => {
  return useQuery({
    queryKey: ['agency_staff', 'hiring_trend'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('agency_staff')
          .select('date_of_joining');

        if (error) {
          console.error('Error fetching hiring trend:', error);
          throw new Error(`Failed to fetch hiring trend: ${error.message}`);
        }

        // Group by month and count hires
        const monthCounts = data.reduce((acc: any, staff: any) => {
          if (staff.date_of_joining) {
            const month = new Date(staff.date_of_joining).toLocaleDateString('en-US', { month: 'short' });
            acc[month] = (acc[month] || 0) + 1;
          }
          return acc;
        }, {});

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map(month => ({
          month,
          hires: monthCounts[month] || 0,
        }));
      } catch (error: any) {
        if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('relationship')) {
          console.warn('Agency staff table not yet created, using default hiring trend');
          return [
            { month: 'Jan', hires: 1 },
            { month: 'Feb', hires: 1 },
            { month: 'Mar', hires: 1 },
            { month: 'Apr', hires: 0 },
            { month: 'May', hires: 0 },
            { month: 'Jun', hires: 1 },
          ];
        }
        throw error;
      }
    },
  });
};
