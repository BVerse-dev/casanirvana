import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

// Database types (commented out due to schema mismatch - using type assertions instead)
// type UnitRow = Database["public"]["Tables"]["units"]["Row"];
// type UnitInsert = Database["public"]["Tables"]["units"]["Insert"];
// type UnitUpdate = Database["public"]["Tables"]["units"]["Update"];

// UI types matching the frontend interface
export interface CommunityUnit {
  id: string;
  unitNumber: string;
  communityId: string;
  communityName: string;
  blockNumber: string;
  floorNumber: number;
  unitType: '1bhk' | '2bhk' | '3bhk' | '4bhk' | 'studio' | 'penthouse' | 'duplex';
  carpetArea: number;
  builtUpArea: number;
  superBuiltUpArea: number;
  balconies: number;
  bathrooms: number;
  bedrooms: number;
  status: 'occupied' | 'vacant' | 'maintenance' | 'reserved' | 'under_renovation';
  ownershipType: 'owned' | 'rented' | 'company_provided';
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  monthlyRent?: number;
  maintenanceCharges: number;
  securityDeposit?: number;
  parkingSlots: string[];
  amenitiesIncluded: string[];
  moveInDate?: string;
  leaseEndDate?: string;
  furnishingStatus: 'furnished' | 'semi_furnished' | 'unfurnished';
  electricityMeterNumber?: string;
  waterMeterNumber?: string;
  internetConnection: boolean;
  cableConnection: boolean;
  gasConnection: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnitFormData {
  unitNumber: string;
  communityId: string;
  blockNumber: string;
  floorNumber: number;
  unitType: string;
  carpetArea: number;
  builtUpArea: number;
  superBuiltUpArea: number;
  balconies: number;
  bathrooms: number;
  bedrooms: number;
  status: string;
  ownershipType: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  monthlyRent?: number;
  maintenanceCharges: number;
  securityDeposit?: number;
  parkingSlots: string[];
  amenitiesIncluded: string[];
  moveInDate?: string;
  leaseEndDate?: string;
  furnishingStatus: string;
  electricityMeterNumber?: string;
  waterMeterNumber?: string;
  internetConnection: boolean;
  cableConnection: boolean;
  gasConnection: boolean;
  notes?: string;
}

export interface UnitStats {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  avgRent: number;
  avgMaintenance: number;
  unitTypeDistribution: Record<string, number>;
}

// Transform database row to UI format (matching actual DB schema)
const transformDbToUI = (dbRow: any): CommunityUnit => {
  return {
    id: dbRow.id,
    unitNumber: dbRow.unit_number || dbRow.number || '',
    communityId: dbRow.community_id,
    communityName: dbRow.communities?.name || '',
    blockNumber: dbRow.block || '',
    floorNumber: dbRow.floor || 0,
    unitType: (dbRow.unit_type || dbRow.type || '2bhk').toLowerCase(),
    carpetArea: dbRow.area_sqft || dbRow.floor_area || dbRow.area || 0,
    builtUpArea: (dbRow.area_sqft || dbRow.floor_area || dbRow.area || 0) * 1.1, // Estimate
    superBuiltUpArea: (dbRow.area_sqft || dbRow.floor_area || dbRow.area || 0) * 1.3, // Estimate
    balconies: dbRow.balcony_count || 1,
    bathrooms: dbRow.bathrooms || dbRow.bathroom_count || 1,
    bedrooms: dbRow.bedrooms || 1,
    status: dbRow.status === 'occupied' ? 'occupied' : 'vacant',
    ownershipType: dbRow.tenant_id ? 'rented' : 'owned',
    ownerName: undefined, // Not available in current schema
    ownerPhone: undefined,
    ownerEmail: undefined,
    tenantName: undefined,
    tenantPhone: undefined,
    tenantEmail: undefined,
    monthlyRent: dbRow.rent_amount || 0,
    maintenanceCharges: dbRow.maintenance_amount || 0,
    securityDeposit: (dbRow.rent_amount || 0) * 3, // Estimate 3 months
    parkingSlots: dbRow.parking_slot ? [dbRow.parking_slot] : [],
    amenitiesIncluded: Array.isArray(dbRow.amenities) ? dbRow.amenities : [],
    moveInDate: undefined,
    leaseEndDate: undefined,
    furnishingStatus: dbRow.is_furnished ? 'furnished' : 'unfurnished',
    electricityMeterNumber: undefined,
    waterMeterNumber: undefined,
    internetConnection: false,
    cableConnection: false,
    gasConnection: false,
    notes: undefined,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
  };
};

// Transform form data to database format (matching actual DB schema)
const transformFormToDb = (formData: UnitFormData): any => {
  return {
    number: formData.unitNumber.split('-').pop() || formData.unitNumber, // Extract number part
    unit_number: formData.unitNumber,
    community_id: formData.communityId,
    block: formData.blockNumber,
    floor: formData.floorNumber,
    unit_type: formData.unitType,
    type: formData.unitType,
    area_sqft: formData.carpetArea,
    floor_area: formData.carpetArea,
    area: formData.carpetArea,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    balcony_count: formData.balconies,
    bathroom_count: formData.bathrooms,
    rent_amount: formData.monthlyRent || 0,
    maintenance_amount: formData.maintenanceCharges,
    status: formData.status,
    is_furnished: formData.furnishingStatus === 'furnished',
    amenities: formData.amenitiesIncluded || [],
    parking_slot: formData.parkingSlots?.[0] || null,
  };
};

// Fetch all community units
export const useCommunityUnits = () => {
  return useQuery({
    queryKey: ['community-units'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('units')
        .select(`
          *,
          communities (
            id,
            name,
            address
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(transformDbToUI) || [];
    },
  });
};

// Fetch units by community
export const useCommunityUnitsByCommunity = (communityId: string) => {
  return useQuery({
    queryKey: ['community-units', communityId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('units')
        .select(`
          *,
          communities (
            id,
            name,
            address
          )
        `)
        .eq('community_id', communityId)
        .order('block', { ascending: true })
        .order('number', { ascending: true });

      if (error) throw error;

      return data?.map(transformDbToUI) || [];
    },
    enabled: !!communityId,
  });
};

// Fetch unit statistics
export const useCommunityUnitStats = () => {
  return useQuery({
    queryKey: ['community-unit-stats'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('units')
        .select('*');

      if (error) throw error;

      const units = data?.map(transformDbToUI) || [];
      
      return {
        totalUnits: units.length,
        occupiedUnits: units.filter((u: CommunityUnit) => u.status === 'occupied').length,
        vacantUnits: units.filter((u: CommunityUnit) => u.status === 'vacant').length,
        occupancyRate: units.length > 0 
          ? (units.filter((u: CommunityUnit) => u.status === 'occupied').length / units.length) * 100 
          : 0,
        avgRent: units.length > 0 
          ? units.filter((u: CommunityUnit) => u.monthlyRent && u.monthlyRent > 0)
                 .reduce((sum: number, u: CommunityUnit) => sum + (u.monthlyRent || 0), 0) / 
            units.filter((u: CommunityUnit) => u.monthlyRent && u.monthlyRent > 0).length 
          : 0,
        avgMaintenance: units.length > 0 
          ? units.reduce((sum: number, u: CommunityUnit) => sum + u.maintenanceCharges, 0) / units.length 
          : 0,
        unitTypeDistribution: units.reduce((acc: Record<string, number>, u: CommunityUnit) => {
          acc[u.unitType] = (acc[u.unitType] || 0) + 1;
          return acc;
        }, {}),
      };
    },
  });
};

// Create unit mutation
export const useCreateCommunityUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: UnitFormData) => {
      const dbData = transformFormToDb(formData);
      
      const { data, error } = await (supabase as any)
        .from('units')
        .insert([dbData])
        .select(`
          *,
          communities (
            id,
            name,
            address
          )
        `)
        .single();

      if (error) throw error;

      return transformDbToUI(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-units'] });
      queryClient.invalidateQueries({ queryKey: ['community-unit-stats'] });
      toast.success('Unit created successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to create unit: ${error.message}`);
    },
  });
};

// Update unit mutation
export const useUpdateCommunityUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: UnitFormData }) => {
      const dbData = transformFormToDb(formData);
      
      const { data, error } = await (supabase as any)
        .from('units')
        .update(dbData)
        .eq('id', id)
        .select(`
          *,
          communities (
            id,
            name,
            address
          )
        `)
        .single();

      if (error) throw error;

      return transformDbToUI(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-units'] });
      queryClient.invalidateQueries({ queryKey: ['community-unit-stats'] });
      toast.success('Unit updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update unit: ${error.message}`);
    },
  });
};

// Delete unit mutation
export const useDeleteCommunityUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('units')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-units'] });
      queryClient.invalidateQueries({ queryKey: ['community-unit-stats'] });
      toast.success('Unit deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete unit: ${error.message}`);
    },
  });
};

// Real-time subscription hook
export const useCommunityUnitsRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:units')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'units' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['community-units'] });
          queryClient.invalidateQueries({ queryKey: ['community-unit-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}; 