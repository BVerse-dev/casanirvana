import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";
import { toast } from "react-hot-toast";

// Database types
type CommunityRow = Database["public"]["Tables"]["communities"]["Row"];
type CommunityInsert = Database["public"]["Tables"]["communities"]["Insert"];
type CommunityUpdate = Database["public"]["Tables"]["communities"]["Update"];

// UI types matching the frontend interface
export interface CommunityProfile {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  website?: string;
  communityType: 'residential' | 'commercial' | 'mixed' | 'gated_community';
  category: 'premium' | 'standard' | 'budget';
  status: 'active' | 'inactive' | 'under_construction' | 'maintenance';
  totalUnits: number;
  totalBlocks: number;
  totalFloors: number;
  amenities: string[];
  establishedYear: number;
  registrationNumber?: string;
  chairman?: string;
  secretary?: string;
  treasurer?: string;
  maintenanceCharge: number;
  parkingSlots: number;
  securityDeposit: number;
  description?: string;
  rules: string[];
  documents: {
    registrationCertificate?: string;
    communityBylaws?: string;
    approvalDocuments?: string;
  };
  bankDetails: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  contactPersons: {
    name: string;
    designation: string;
    phone: string;
    email: string;
  }[];
}

export interface CommunityFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  website?: string;
  communityType: string;
  category: string;
  status: string;
  totalUnits: number;
  totalBlocks: number;
  totalFloors: number;
  establishedYear: number;
  registrationNumber?: string;
  chairman?: string;
  secretary?: string;
  treasurer?: string;
  maintenanceCharge: number;
  parkingSlots: number;
  securityDeposit: number;
  description?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
}

// Transform database row to UI format
const transformDbToUI = (dbRow: CommunityRow): CommunityProfile => {
  // Use type assertion since database types are not yet updated with new schema
  const row = dbRow as any;
  
  return {
    id: row.id,
    name: row.name,
    address: row.address || '',
    city: row.city || '',
    state: row.state || '',
    pincode: row.pincode || '',
    phone: row.phone || undefined,
    email: row.email || undefined,
    website: row.website || undefined,
    communityType: row.community_type || 'residential',
    category: row.category || 'standard',
    status: row.status || 'active',
    totalUnits: row.total_units || 0,
    totalBlocks: row.total_blocks || 0,
    totalFloors: row.total_floors || 0,
    amenities: row.amenities || [],
    establishedYear: row.established_year || new Date().getFullYear(),
    registrationNumber: row.registration_number || undefined,
    chairman: row.chairman || undefined,
    secretary: row.secretary || undefined,
    treasurer: row.treasurer || undefined,
    maintenanceCharge: Number(row.maintenance_charge) || 0,
    parkingSlots: row.parking_slots || 0,
    securityDeposit: Number(row.security_deposit) || 0,
    description: row.description || undefined,
    rules: row.rules || [],
    documents: row.documents || {},
    bankDetails: row.bank_details || {},
    contactPersons: row.contact_persons || [],
  };
};

// Transform form data to database format
const transformFormToDb = (formData: CommunityFormData): any => {
  return {
    name: formData.name,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    pincode: formData.pincode,
    phone: formData.phone || null,
    email: formData.email || null,
    website: formData.website || null,
    community_type: formData.communityType,
    category: formData.category,
    status: formData.status,
    total_units: formData.totalUnits,
    total_blocks: formData.totalBlocks,
    total_floors: formData.totalFloors,
    established_year: formData.establishedYear,
    registration_number: formData.registrationNumber || null,
    chairman: formData.chairman || null,
    secretary: formData.secretary || null,
    treasurer: formData.treasurer || null,
    maintenance_charge: formData.maintenanceCharge,
    parking_slots: formData.parkingSlots,
    security_deposit: formData.securityDeposit,
    description: formData.description || null,
    bank_details: {
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      accountHolderName: formData.accountHolderName,
    },
  };
};

// Hooks for data fetching
export const useCommunityProfiles = (searchTerm?: string, filterType?: string, filterStatus?: string) => {
  return useQuery({
    queryKey: ["community-profiles", searchTerm, filterType, filterStatus],
    queryFn: async () => {
      let query = (supabase as any)
        .from("communities")
        .select("*")
        .order("name");

      // Apply filters
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }
      
      if (filterType && filterType !== 'all') {
        query = query.eq('community_type', filterType);
      }
      
      if (filterStatus && filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching community profiles:", error);
        throw new Error(`Failed to fetch community profiles: ${error.message}`);
      }

      return (data || []).map(transformDbToUI);
    },
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

export const useCommunityProfile = (id: string) => {
  return useQuery({
    queryKey: ["community-profile", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("communities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching community profile:", error);
        throw new Error(`Failed to fetch community profile: ${error.message}`);
      }

      return transformDbToUI(data);
    },
    enabled: !!id,
    staleTime: 30000,
    gcTime: 300000,
  });
};

export const useCommunityStats = () => {
  return useQuery({
    queryKey: ["community-stats"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("communities")
        .select("*");

      if (error) {
        console.error("Error fetching community stats:", error);
        throw new Error(`Failed to fetch community stats: ${error.message}`);
      }

      const communities = (data || []).map(transformDbToUI);
      
      // Basic stats
      const totalCommunities = communities.length;
      const activeCommunities = communities.filter((s: CommunityProfile) => s.status === 'active').length;
      const totalUnits = communities.reduce((sum: number, s: CommunityProfile) => sum + s.totalUnits, 0);
      const totalParkingSlots = communities.reduce((sum: number, s: CommunityProfile) => sum + s.parkingSlots, 0);
      const avgMaintenanceCharge = communities.length > 0 
        ? communities.reduce((sum: number, s: CommunityProfile) => sum + s.maintenanceCharge, 0) / communities.length 
        : 0;
      
      // Enhanced analytics
      const communityTypeBreakdown = communities.reduce((acc: any, c: CommunityProfile) => {
        acc[c.communityType] = (acc[c.communityType] || 0) + 1;
        return acc;
      }, {});
      
      const categoryBreakdown = communities.reduce((acc: any, c: CommunityProfile) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {});
      
      const statusBreakdown = communities.reduce((acc: any, c: CommunityProfile) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {});
      
      // Size distribution
      const sizeCategories = {
        small: communities.filter((c: CommunityProfile) => c.totalUnits <= 50).length,
        medium: communities.filter((c: CommunityProfile) => c.totalUnits > 50 && c.totalUnits <= 200).length,
        large: communities.filter((c: CommunityProfile) => c.totalUnits > 200 && c.totalUnits <= 500).length,
        extraLarge: communities.filter((c: CommunityProfile) => c.totalUnits > 500).length,
      };
      
      // Revenue projections
      const totalMaintenanceRevenue = communities.reduce((sum: number, c: CommunityProfile) => 
        sum + (c.maintenanceCharge * c.totalUnits), 0);
      
      // Age distribution
      const currentYear = new Date().getFullYear();
      const ageDistribution = {
        new: communities.filter((c: CommunityProfile) => currentYear - c.establishedYear <= 5).length,
        established: communities.filter((c: CommunityProfile) => currentYear - c.establishedYear > 5 && currentYear - c.establishedYear <= 15).length,
        mature: communities.filter((c: CommunityProfile) => currentYear - c.establishedYear > 15).length,
      };
      
      // City-wise distribution
      const cityDistribution = communities.reduce((acc: any, c: CommunityProfile) => {
        const city = c.city || 'Unknown';
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {});
      
      // Top cities (limit to top 5)
      const topCities = Object.entries(cityDistribution)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5)
        .map(([city, count]) => ({ name: city, value: count }));
      
      // Amenities popularity
      const amenitiesCount = communities.reduce((acc: any, c: CommunityProfile) => {
        c.amenities.forEach((amenity: string) => {
          acc[amenity] = (acc[amenity] || 0) + 1;
        });
        return acc;
      }, {});
      
      const topAmenities = Object.entries(amenitiesCount)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 10)
        .map(([amenity, count]) => ({ name: amenity, value: count }));
      
      return {
        // Basic stats
        totalCommunities,
        activeCommunities,
        totalUnits,
        totalParkingSlots,
        avgMaintenanceCharge,
        
        // Enhanced analytics
        communityTypeBreakdown,
        categoryBreakdown,
        statusBreakdown,
        sizeCategories,
        totalMaintenanceRevenue,
        ageDistribution,
        topCities,
        topAmenities,
        
        // Calculated metrics
        averageUnitsPerCommunity: totalCommunities > 0 ? Math.round(totalUnits / totalCommunities) : 0,
        occupancyRate: 85, // This would come from units data in a real scenario
        maintenancePerUnit: totalUnits > 0 ? Math.round(totalMaintenanceRevenue / totalUnits) : 0,
        parkingRatio: totalUnits > 0 ? ((totalParkingSlots / totalUnits) * 100).toFixed(1) : 0,
      };
    },
    staleTime: 60000, // 1 minute
    gcTime: 300000,
  });
};

// Mutation hooks
export const useCreateCommunityProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CommunityFormData) => {
      const dbData = transformFormToDb(formData);
      
      const { data, error } = await (supabase as any)
        .from("communities")
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error("Error creating community profile:", error);
        throw new Error(`Failed to create community profile: ${error.message}`);
      }

      return transformDbToUI(data);
    },
    onSuccess: (data) => {
      // Invalidate and refetch community profiles
      queryClient.invalidateQueries({ queryKey: ["community-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["community-stats"] });
      
      toast.success(`Community "${data.name}" created successfully!`);
    },
    onError: (error: Error) => {
      console.error("Create community profile error:", error);
      toast.error(`Failed to create community: ${error.message}`);
    },
  });
};

export const useUpdateCommunityProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: CommunityFormData }) => {
      const dbData = transformFormToDb(formData);
      
      const { data, error } = await (supabase as any)
        .from("communities")
        .update(dbData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating community profile:", error);
        throw new Error(`Failed to update community profile: ${error.message}`);
      }

      return transformDbToUI(data);
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["community-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["community-profile", data.id] });
      queryClient.invalidateQueries({ queryKey: ["community-stats"] });
      
      toast.success(`Community "${data.name}" updated successfully!`);
    },
    onError: (error: Error) => {
      console.error("Update community profile error:", error);
      toast.error(`Failed to update community: ${error.message}`);
    },
  });
};

export const useDeleteCommunityProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("communities")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting community profile:", error);
        throw new Error(`Failed to delete community profile: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch community profiles
      queryClient.invalidateQueries({ queryKey: ["community-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["community-stats"] });
      
      toast.success("Community deleted successfully!");
    },
    onError: (error: Error) => {
      console.error("Delete community profile error:", error);
      toast.error(`Failed to delete community: ${error.message}`);
    },
  });
};

// Real-time subscription hook
export const useCommunityProfilesRealtime = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["community-profiles-realtime"],
    queryFn: () => null,
    enabled: false,
    initialData: null,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: Infinity,
    meta: {
      subscription: () => {
        const channel = supabase
          .channel('communities-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'communities',
            },
            (payload) => {
              console.log('Community profiles real-time update:', payload);
              
              // Invalidate relevant queries to trigger refetch
              queryClient.invalidateQueries({ queryKey: ["community-profiles"] });
              queryClient.invalidateQueries({ queryKey: ["community-stats"] });
              
              if (payload.eventType === 'UPDATE' && payload.new?.id) {
                queryClient.invalidateQueries({ 
                  queryKey: ["community-profile", payload.new.id] 
                });
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      },
    },
  });
}; 