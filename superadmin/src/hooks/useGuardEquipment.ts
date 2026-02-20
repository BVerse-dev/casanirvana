'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

// Type definitions matching UI interfaces
export interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  category: 'security' | 'communication' | 'safety' | 'medical' | 'maintenance' | 'technology';
  type: string;
  brand: string;
  model: string;
  purchaseDate: string;
  warrantyExpiry: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_repair';
  status: 'available' | 'assigned' | 'maintenance' | 'lost' | 'damaged' | 'retired';
  location: string;
  assignedTo?: string;
  assignedGuardName?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  cost: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  guardId: string;
  guardName: string;
  assignedDate: string;
  returnDate?: string;
  purpose: string;
  condition: 'good' | 'damaged' | 'lost';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'routine' | 'repair' | 'upgrade' | 'inspection';
  description: string;
  performedBy: string;
  performedDate: string;
  cost: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEquipmentData {
  name: string;
  serialNumber: string;
  category: Equipment['category'];
  type: string;
  brand: string;
  model: string;
  purchaseDate: string;
  warrantyExpiry: string;
  condition: Equipment['condition'];
  status: Equipment['status'];
  location: string;
  cost: number;
  notes?: string;
}

export interface CreateAssignmentData {
  equipmentId: string;
  guardId: string;
  purpose: string;
  notes?: string;
}

export interface CreateMaintenanceData {
  equipmentId: string;
  type: MaintenanceRecord['type'];
  description: string;
  performedBy: string;
  performedDate: string;
  cost: number;
  priority: MaintenanceRecord['priority'];
  notes?: string;
}

export interface EquipmentStats {
  total: number;
  available: number;
  assigned: number;
  maintenance: number;
  lost: number;
  damaged: number;
  retired: number;
  needMaintenance: number;
  totalValue: number;
  deployedValue: number;
  maintenanceCost: number;
  averageItemCost: number;
}

// Transform functions
const transformDbEquipmentToUI = (dbEquipment: any): Equipment => ({
  id: dbEquipment.id,
  name: dbEquipment.name,
  serialNumber: dbEquipment.serial_number,
  category: dbEquipment.category,
  type: dbEquipment.type,
  brand: dbEquipment.brand,
  model: dbEquipment.model,
  purchaseDate: dbEquipment.purchase_date,
  warrantyExpiry: dbEquipment.warranty_expiry,
  condition: dbEquipment.condition,
  status: dbEquipment.status,
  location: dbEquipment.location,
  assignedTo: dbEquipment.assigned_to,
  assignedGuardName: dbEquipment.assigned_guard_name,
  lastMaintenance: dbEquipment.last_maintenance,
  nextMaintenance: dbEquipment.next_maintenance,
  cost: parseFloat(dbEquipment.cost || '0'),
  notes: dbEquipment.notes,
  createdAt: dbEquipment.created_at,
  updatedAt: dbEquipment.updated_at,
});

const transformDbAssignmentToUI = (dbAssignment: any): EquipmentAssignment => ({
  id: dbAssignment.id,
  equipmentId: dbAssignment.equipment_id,
  guardId: dbAssignment.guard_id,
  guardName: dbAssignment.guard_name,
  assignedDate: dbAssignment.assigned_date,
  returnDate: dbAssignment.return_date || dbAssignment.returned_date,
  purpose: dbAssignment.purpose,
  condition: dbAssignment.condition_at_assignment || dbAssignment.condition || 'good',
  notes: dbAssignment.notes,
  createdAt: dbAssignment.created_at,
  updatedAt: dbAssignment.updated_at,
});

const transformDbMaintenanceToUI = (dbMaintenance: any): MaintenanceRecord => ({
  id: dbMaintenance.id,
  equipmentId: dbMaintenance.equipment_id,
  equipmentName: dbMaintenance.equipment_name,
  type: dbMaintenance.type,
  description: dbMaintenance.description,
  performedBy: dbMaintenance.performed_by,
  performedDate: dbMaintenance.performed_date,
  cost: parseFloat(dbMaintenance.cost || '0'),
  status: dbMaintenance.status,
  priority: dbMaintenance.priority,
  createdAt: dbMaintenance.created_at,
  updatedAt: dbMaintenance.updated_at,
});

// Equipment Hooks
export const useEquipment = (filters?: {
  category?: string;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['equipment', filters],
    queryFn: async () => {
      try {
        let query = (supabase as any)
          .from('guard_equipment')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters?.search) {
          query = query.or(`name.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching equipment:', error);
          throw new Error(`Failed to fetch equipment: ${error.message}`);
        }

        return data?.map(transformDbEquipmentToUI) || [];
      } catch (error) {
        console.error('Error in useEquipment:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEquipmentData) => {
      const { data: result, error } = await (supabase as any)
        .from('guard_equipment')
        .insert({
          name: data.name,
          serial_number: data.serialNumber,
          category: data.category,
          type: data.type,
          brand: data.brand,
          model: data.model,
          purchase_date: data.purchaseDate,
          warranty_expiry: data.warrantyExpiry,
          condition: data.condition,
          status: data.status,
          location: data.location,
          cost: data.cost,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return transformDbEquipmentToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
      toast.success('Equipment added successfully');
    },
    onError: (error) => {
      console.error('Error creating equipment:', error);
      toast.error('Failed to add equipment');
    },
  });
};

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateEquipmentData> }) => {
      const updateData: any = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.serialNumber !== undefined) updateData.serial_number = data.serialNumber;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.brand !== undefined) updateData.brand = data.brand;
      if (data.model !== undefined) updateData.model = data.model;
      if (data.purchaseDate !== undefined) updateData.purchase_date = data.purchaseDate;
      if (data.warrantyExpiry !== undefined) updateData.warranty_expiry = data.warrantyExpiry;
      if (data.condition !== undefined) updateData.condition = data.condition;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.cost !== undefined) updateData.cost = data.cost;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const { data: result, error } = await (supabase as any)
        .from('guard_equipment')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformDbEquipmentToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
      toast.success('Equipment updated successfully');
    },
    onError: (error) => {
      console.error('Error updating equipment:', error);
      toast.error('Failed to update equipment');
    },
  });
};

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('guard_equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
      toast.success('Equipment deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting equipment:', error);
      toast.error('Failed to delete equipment');
    },
  });
};

// Equipment Assignments Hooks
export const useEquipmentAssignments = (filters?: {
  equipmentId?: string;
  guardId?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['equipment-assignments', filters],
    queryFn: async () => {
      try {
        let query = (supabase as any)
          .from('equipment_assignments')
          .select(`
            *,
            guard_equipment!inner(name, serial_number, category)
          `)
          .is('returned_date', null) // Only active assignments
          .order('created_at', { ascending: false });

        if (filters?.equipmentId) {
          query = query.eq('equipment_id', filters.equipmentId);
        }

        if (filters?.guardId) {
          query = query.eq('guard_id', filters.guardId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching equipment assignments:', error);
          throw new Error(`Failed to fetch equipment assignments: ${error.message}`);
        }

        // Get guard names from guards table
        const assignmentsWithGuardNames = await Promise.all(
          (data || []).map(async (assignment: any) => {
            const { data: guardData } = await (supabase as any)
              .from('guards')
              .select('full_name, first_name, last_name')
              .eq('id', assignment.guard_id)
              .single();

            return {
              ...assignment,
              guard_name: guardData?.full_name || `${guardData?.first_name} ${guardData?.last_name}` || 'Unknown Guard'
            };
          })
        );

        return assignmentsWithGuardNames.map(transformDbAssignmentToUI);
      } catch (error) {
        console.error('Error in useEquipmentAssignments:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateEquipmentAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAssignmentData) => {
      // Get guard details first
      const { data: guardData, error: guardError } = await (supabase as any)
        .from('guards')
        .select('full_name, first_name, last_name')
        .eq('id', data.guardId)
        .single();

      if (guardError) throw guardError;

      const guardName = guardData.full_name || `${guardData.first_name} ${guardData.last_name}`;

      const { data: result, error } = await (supabase as any)
        .from('equipment_assignments')
        .insert({
          equipment_id: data.equipmentId,
          guard_id: data.guardId,
          guard_name: guardName,
          purpose: data.purpose,
          notes: data.notes,
          condition_at_assignment: 'good',
        })
        .select()
        .single();

      if (error) throw error;

      // Update equipment status to assigned
      await (supabase as any)
        .from('guard_equipment')
        .update({ 
          status: 'assigned',
          assigned_to: data.guardId,
          assigned_guard_name: guardName
        })
        .eq('id', data.equipmentId);

      return transformDbAssignmentToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
      toast.success('Equipment assigned successfully');
    },
    onError: (error) => {
      console.error('Error assigning equipment:', error);
      toast.error('Failed to assign equipment');
    },
  });
};

export const useReturnEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, condition, notes }: {
      assignmentId: string;
      condition: EquipmentAssignment['condition'];
      notes?: string;
    }) => {
      // Get the assignment details first
      const { data: assignment, error: assignmentError } = await (supabase as any)
        .from('equipment_assignments')
        .select('equipment_id')
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;

      // Update assignment with return date
      const { data: result, error } = await (supabase as any)
        .from('equipment_assignments')
        .update({
          returned_date: new Date().toISOString().split('T')[0],
          condition_at_return: condition,
          notes: notes,
        })
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;

      // Update equipment status based on condition
      const newStatus = condition === 'damaged' ? 'damaged' : 'available';
      await (supabase as any)
        .from('guard_equipment')
        .update({ 
          status: newStatus,
          assigned_to: null,
          assigned_guard_name: null
        })
        .eq('id', assignment.equipment_id);

      return transformDbAssignmentToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
      toast.success('Equipment returned successfully');
    },
    onError: (error) => {
      console.error('Error returning equipment:', error);
      toast.error('Failed to return equipment');
    },
  });
};

// Maintenance Records Hooks
export const useMaintenanceRecords = (filters?: {
  equipmentId?: string;
  status?: string;
  priority?: string;
}) => {
  return useQuery({
    queryKey: ['equipment-maintenance', filters],
    queryFn: async () => {
      try {
        let query = (supabase as any)
          .from('equipment_maintenance')
          .select(`
            *,
            guard_equipment!inner(name)
          `)
          .order('created_at', { ascending: false });

        if (filters?.equipmentId) {
          query = query.eq('equipment_id', filters.equipmentId);
        }

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters?.priority && filters.priority !== 'all') {
          query = query.eq('priority', filters.priority);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching maintenance records:', error);
          throw new Error(`Failed to fetch maintenance records: ${error.message}`);
        }

        return (data || []).map((record: any) => ({
          ...record,
          equipment_name: record.guard_equipment?.name || 'Unknown Equipment'
        })).map(transformDbMaintenanceToUI);
      } catch (error) {
        console.error('Error in useMaintenanceRecords:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateMaintenanceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMaintenanceData) => {
      // Get equipment name first
      const { data: equipmentData, error: equipmentError } = await (supabase as any)
        .from('guard_equipment')
        .select('name')
        .eq('id', data.equipmentId)
        .single();

      if (equipmentError) throw equipmentError;

      const { data: result, error } = await (supabase as any)
        .from('equipment_maintenance')
        .insert({
          equipment_id: data.equipmentId,
          equipment_name: equipmentData.name,
          type: data.type,
          description: data.description,
          performed_by: data.performedBy,
          performed_date: data.performedDate,
          cost: data.cost,
          priority: data.priority,
          status: 'scheduled',
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return transformDbMaintenanceToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
      toast.success('Maintenance record created successfully');
    },
    onError: (error) => {
      console.error('Error creating maintenance record:', error);
      toast.error('Failed to create maintenance record');
    },
  });
};

export const useUpdateMaintenanceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, cost }: {
      id: string;
      status: MaintenanceRecord['status'];
      cost?: number;
    }) => {
      const updateData: any = { status };
      if (cost !== undefined) updateData.cost = cost;

      const { data: result, error } = await (supabase as any)
        .from('equipment_maintenance')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformDbMaintenanceToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
      toast.success('Maintenance status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating maintenance status:', error);
      toast.error('Failed to update maintenance status');
    },
  });
};

// Equipment Statistics Hook
export const useEquipmentStats = () => {
  return useQuery({
    queryKey: ['equipment-stats'],
    queryFn: async () => {
      try {
        const [equipmentResult, maintenanceResult] = await Promise.all([
          (supabase as any).from('guard_equipment').select('status, cost, next_maintenance'),
          (supabase as any).from('equipment_maintenance').select('cost')
        ]);

        if (equipmentResult.error) throw equipmentResult.error;
        if (maintenanceResult.error) throw maintenanceResult.error;

        const equipment = equipmentResult.data || [];
        const maintenance = maintenanceResult.data || [];

        const total = equipment.length;
        const available = equipment.filter((e: any) => e.status === 'available').length;
        const assigned = equipment.filter((e: any) => e.status === 'assigned').length;
        const maintenanceCount = equipment.filter((e: any) => e.status === 'maintenance').length;
        const lost = equipment.filter((e: any) => e.status === 'lost').length;
        const damaged = equipment.filter((e: any) => e.status === 'damaged').length;
        const retired = equipment.filter((e: any) => e.status === 'retired').length;

        const needMaintenance = equipment.filter((e: any) => {
          if (!e.next_maintenance) return false;
          const nextDate = new Date(e.next_maintenance);
          const today = new Date();
          return nextDate <= today;
        }).length;

        const totalValue = equipment.reduce((sum: number, item: any) => sum + parseFloat(item.cost || '0'), 0);
        const deployedValue = equipment
          .filter((e: any) => e.status === 'assigned')
          .reduce((sum: number, item: any) => sum + parseFloat(item.cost || '0'), 0);
        const maintenanceCost = maintenance.reduce((sum: number, record: any) => sum + parseFloat(record.cost || '0'), 0);
        const averageItemCost = total > 0 ? totalValue / total : 0;

        const stats: EquipmentStats = {
          total,
          available,
          assigned,
          maintenance: maintenanceCount,
          lost,
          damaged,
          retired,
          needMaintenance,
          totalValue,
          deployedValue,
          maintenanceCost,
          averageItemCost,
        };

        return stats;
      } catch (error) {
        console.error('Error fetching equipment stats:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Real-time subscription hook
export const useGuardEquipmentRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const equipmentChannel = (supabase as any)
      .channel('public:guard_equipment')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guard_equipment' }, () => {
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
      })
      .subscribe();

    const assignmentsChannel = (supabase as any)
      .channel('public:equipment_assignments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_assignments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['equipment-assignments'] });
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
      })
      .subscribe();

    const maintenanceChannel = (supabase as any)
      .channel('public:equipment_maintenance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_maintenance' }, () => {
        queryClient.invalidateQueries({ queryKey: ['equipment-maintenance'] });
        queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
      })
      .subscribe();

    return () => {
      (supabase as any).removeChannel(equipmentChannel);
      (supabase as any).removeChannel(assignmentsChannel);
      (supabase as any).removeChannel(maintenanceChannel);
    };
  }, [queryClient]);
};
