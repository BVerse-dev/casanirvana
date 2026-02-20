import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { toast } from 'react-hot-toast';

// Type definitions based on UI requirements
export interface GuardAssignment {
  id: string;
  guardId: string;
  guardName: string;
  guardPhone: string;
  guardLicense: string;
  communityId: string;
  societyName: string;
  societyAddress: string;
  buildingId?: string;
  buildingName?: string;
  postLocation: string;
  assignmentType: 'permanent' | 'temporary' | 'relief' | 'on_call';
  shiftType: 'day' | 'night' | 'rotating' | 'split';
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'suspended' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  responsibilities: string[];
  emergencyContact: string;
  replacementId?: string;
  replacementName?: string;
  notes?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface Society {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  totalBuildings: number;
  securityRequirement: 'high' | 'medium' | 'low';
  currentGuards: number;
  requiredGuards: number;
}

export interface CreateAssignmentData {
  guardId: string;
  communityId: string;
  buildingId?: string;
  postLocation: string;
  assignmentType: 'permanent' | 'temporary' | 'relief' | 'on_call';
  shiftType: 'day' | 'night' | 'rotating' | 'split';
  startDate: string;
  endDate?: string;
  priority: 'high' | 'medium' | 'low';
  responsibilities: string[];
  emergencyContact?: string;
  notes?: string;
}

// Query Keys
const QUERY_KEYS = {
  assignments: ['guard-assignments'] as const,
  assignmentById: (id: string) => ['guard-assignments', id] as const,
  assignmentsByGuard: (guardId: string) => ['guard-assignments', 'by-guard', guardId] as const,
  assignmentsByCommunity: (communityId: string) => ['guard-assignments', 'by-community', communityId] as const,
  communityOverview: ['community-overview'] as const,
  assignmentStats: ['assignment-stats'] as const,
};

// Hook for fetching all guard assignments
export const useGuardAssignments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.assignments,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guard_assignments')
        .select(`
          id,
          guard_id,
          community_id,
          assignment_name,
          shift_type,
          start_date,
          end_date,
          status,
          assigned_location,
          assigned_gate,
          patrol_areas,
          responsibilities,
          emergency_contact,
          backup_guard_id,
          special_instructions,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching guard assignments:', error);
        throw new Error(`Failed to fetch guard assignments: ${error.message}`);
      }

      // Fetch related data
      const assignments = data || [];
      const guardIds = [...new Set([...assignments.map(a => a.guard_id), ...assignments.map(a => a.backup_guard_id).filter(Boolean)])];
      const communityIds = [...new Set(assignments.map(a => a.community_id))];

      // Fetch guards data
      const { data: guardsData } = await supabase
        .from('guards')
        .select('id, full_name, emergency_contact, license_number')
        .in('id', guardIds.filter(id => id !== null) as string[]);

      // Fetch communities data
      const { data: communitiesData } = await supabase
        .from('communities')
        .select('id, name, address')
        .in('id', communityIds);

      // Create lookup maps
      const guardsMap = new Map(guardsData?.map(g => [g.id, g]) || []);
      const communitiesMap = new Map(communitiesData?.map(c => [c.id, c]) || []);

      // Transform assignments with related data
      return assignments.map(assignment => {
        const guard = guardsMap.get(assignment.guard_id);
        const community = communitiesMap.get(assignment.community_id);
        const backupGuard = assignment.backup_guard_id ? guardsMap.get(assignment.backup_guard_id) : null;
        
        // Determine assignment type based on existing data
        let assignmentType: GuardAssignment['assignmentType'] = 'permanent';
        if (assignment.end_date) {
          assignmentType = 'temporary';
        }
        
        // Map status
        let status: GuardAssignment['status'] = 'active';
        if (assignment.status === 'inactive') status = 'inactive';
        else if (assignment.status === 'suspended') status = 'suspended';
        
        return {
          id: assignment.id,
          guardId: assignment.guard_id,
          guardName: guard?.full_name || 'Unknown',
          guardPhone: guard?.emergency_contact || '',
          guardLicense: guard?.license_number || '',
          communityId: assignment.community_id,
          societyName: community?.name || 'Unknown Community',
          societyAddress: community?.address || '',
          postLocation: assignment.assigned_location || assignment.assigned_gate || 'Unassigned',
          assignmentType,
          shiftType: (assignment.shift_type?.toLowerCase() || 'day') as GuardAssignment['shiftType'],
          startDate: assignment.start_date,
          endDate: assignment.end_date,
          status,
          priority: 'medium' as GuardAssignment['priority'], // Default since not in DB
          responsibilities: assignment.responsibilities || [],
          emergencyContact: assignment.emergency_contact || guard?.emergency_contact || '+1-555-0911',
          replacementId: assignment.backup_guard_id,
          replacementName: backupGuard?.full_name,
          notes: assignment.special_instructions,
          createdAt: assignment.created_at,
          lastUpdated: assignment.updated_at,
        } as GuardAssignment;
      });
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching community overview with guard counts
export const useCommunityOverview = () => {
  return useQuery({
    queryKey: QUERY_KEYS.communityOverview,
    queryFn: async () => {
      // Fetch all communities
      const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('*')
        .order('name');

      if (communitiesError) {
        console.error('Error fetching communities:', communitiesError);
        throw new Error(`Failed to fetch communities: ${communitiesError.message}`);
      }

      // Fetch unit counts per society
      const { data: unitCounts } = await supabase
        .from('units')
        .select('community_id, id')
        .in('community_id', communities?.map(c => c.id) || []);

      // Fetch active guard assignments per society
      const { data: guardAssignments } = await supabase
        .from('guard_assignments')
        .select('community_id, guard_id')
        .eq('status', 'active')
        .in('community_id', (communities?.map(c => c.id) || []).filter(id => id !== null) as string[]);

      // Create count maps
      const unitCountMap = new Map<string, number>();
      unitCounts?.forEach(unit => {
        if (unit.community_id) {
          const count = unitCountMap.get(unit.community_id) || 0;
          unitCountMap.set(unit.community_id, count + 1);
        }
      });

      const guardCountMap = new Map<string, Set<string>>();
      guardAssignments?.forEach(assignment => {
        if (assignment.community_id && assignment.guard_id) {
          if (!guardCountMap.has(assignment.community_id)) {
            guardCountMap.set(assignment.community_id, new Set());
          }
          guardCountMap.get(assignment.community_id)?.add(assignment.guard_id);
        }
      });

      // Transform communities with counts
      return communities?.map(community => {
        const totalUnits = unitCountMap.get(community.id) || 0;
        const currentGuards = guardCountMap.get(community.id)?.size || 0;
        
        // Calculate required guards based on units (1 guard per 50 units, minimum 1)
        const requiredGuards = Math.max(1, Math.ceil(totalUnits / 50));
        
        // Determine security requirement based on size
        let securityRequirement: 'high' | 'medium' | 'low' = 'low';
        if (totalUnits > 150) securityRequirement = 'high';
        else if (totalUnits > 80) securityRequirement = 'medium';

        return {
          id: community.id,
          name: community.name,
          address: community.address || '',
          totalUnits,
          totalBuildings: 1, // This would need a proper building count query
          securityRequirement,
          currentGuards,
          requiredGuards,
        } as Society;
      }) || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Mutation for creating a new assignment
export const useCreateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentData: CreateAssignmentData) => {
      const { data, error } = await supabase
        .from('guard_assignments')
        .insert({
          guard_id: assignmentData.guardId,
          community_id: assignmentData.communityId,
          assignment_name: `${assignmentData.assignmentType} Assignment`,
          shift_type: assignmentData.shiftType,
          start_date: assignmentData.startDate,
          end_date: assignmentData.endDate || null,
          status: 'active',
          assigned_location: assignmentData.postLocation,
          assigned_gate: assignmentData.postLocation,
          patrol_areas: [],
          responsibilities: assignmentData.responsibilities,
          emergency_contact: assignmentData.emergencyContact || '+1-555-0911',
          special_instructions: assignmentData.notes || null,
          is_permanent: assignmentData.assignmentType === 'permanent',
          is_temporary: assignmentData.assignmentType === 'temporary',
          // Required fields based on DB schema
          start_time: '08:00:00',
          end_time: '17:00:00',
          days_of_week: [1, 2, 3, 4, 5], // Monday to Friday as integers
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating assignment:', error);
        throw new Error(`Failed to create assignment: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityOverview });
      toast.success('Guard assignment created successfully!');
    },
    onError: (error: Error) => {
      console.error('Create assignment error:', error);
      toast.error(error.message || 'Failed to create assignment');
    },
  });
};

// Mutation for updating an assignment
export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, assignmentData }: { id: string; assignmentData: Partial<CreateAssignmentData> }) => {
      const updateData: any = {};
      
      if (assignmentData.guardId) updateData.guard_id = assignmentData.guardId;
      if (assignmentData.communityId) updateData.community_id = assignmentData.communityId;
      if (assignmentData.postLocation) {
        updateData.assigned_location = assignmentData.postLocation;
        updateData.assigned_gate = assignmentData.postLocation;
      }
      if (assignmentData.assignmentType) {
        updateData.assignment_name = `${assignmentData.assignmentType} Assignment`;
        updateData.is_permanent = assignmentData.assignmentType === 'permanent';
        updateData.is_temporary = assignmentData.assignmentType === 'temporary';
      }
      if (assignmentData.shiftType) updateData.shift_type = assignmentData.shiftType;
      if (assignmentData.startDate) updateData.start_date = assignmentData.startDate;
      if (assignmentData.endDate !== undefined) updateData.end_date = assignmentData.endDate || null;
      if (assignmentData.responsibilities) updateData.responsibilities = assignmentData.responsibilities;
      if (assignmentData.emergencyContact !== undefined) updateData.emergency_contact = assignmentData.emergencyContact;
      if (assignmentData.notes !== undefined) updateData.special_instructions = assignmentData.notes || null;

      const { data, error } = await supabase
        .from('guard_assignments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating assignment:', error);
        throw new Error(`Failed to update assignment: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityOverview });
      toast.success('Assignment updated successfully!');
    },
    onError: (error: Error) => {
      console.error('Update assignment error:', error);
      toast.error(error.message || 'Failed to update assignment');
    },
  });
};

// Mutation for updating assignment status
export const useUpdateAssignmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: GuardAssignment['status'] }) => {
      const { data, error } = await supabase
        .from('guard_assignments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating assignment status:', error);
        throw new Error(`Failed to update assignment status: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityOverview });
      toast.success('Assignment status updated successfully!');
    },
    onError: (error: Error) => {
      console.error('Update assignment status error:', error);
      toast.error(error.message || 'Failed to update assignment status');
    },
  });
};

// Mutation for deleting an assignment
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guard_assignments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting assignment:', error);
        throw new Error(`Failed to delete assignment: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityOverview });
      toast.success('Assignment deleted successfully!');
    },
    onError: (error: Error) => {
      console.error('Delete assignment error:', error);
      toast.error(error.message || 'Failed to delete assignment');
    },
  });
};

// Hook for assignment statistics
export const useAssignmentStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.assignmentStats,
    queryFn: async () => {
      const { data: assignments, error } = await supabase
        .from('guard_assignments')
        .select('assignment_name, status, is_permanent, is_temporary')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching assignment stats:', error);
        throw new Error(`Failed to fetch assignment stats: ${error.message}`);
      }

      // Calculate statistics
      const stats = {
        total: assignments?.length || 0,
        byType: {
          permanent: 0,
          temporary: 0,
          relief: 0,
          on_call: 0,
        },
        byStatus: {
          active: 0,
          inactive: 0,
          suspended: 0,
          completed: 0,
          cancelled: 0,
        },
      };

      assignments?.forEach(assignment => {
        if (assignment.is_permanent) {
          stats.byType.permanent++;
        } else if (assignment.is_temporary) {
          stats.byType.temporary++;
        }
        stats.byStatus.active++;
      });

      return stats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to setup real-time subscriptions
export const useGuardAssignmentsRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('guard_assignments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guard_assignments',
        },
        (payload) => {
          console.log('Guard assignments change detected:', payload);
          // Invalidate queries to refetch fresh data
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.societyOverview });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}; 