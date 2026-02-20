"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";

type Complaint = Database["public"]["Tables"]["complaints"]["Row"];
type ComplaintInsert = Database["public"]["Tables"]["complaints"]["Insert"];
type ComplaintUpdate = Database["public"]["Tables"]["complaints"]["Update"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const useAdminFetch = () => {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Missing admin session. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || 'Request failed');
    }
    return payload;
  };

  return { fetchAdmin };
};

// Helper function to map database complaint to consistent format
const mapComplaint = (complaint: any) => ({
  ...complaint,
  // Ensure both title/description and subject/details are available
  title: complaint.title || complaint.subject,
  description: complaint.description || complaint.details,
  subject: complaint.subject || complaint.title,
  details: complaint.details || complaint.description,
});

// Real-time subscription hook for complaints (singleton pattern)
let complaintsChannel: any = null;
let subscriberCount = 0;

export const useComplaintsRealTime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    subscriberCount++;
    
    // Only create channel if it doesn't exist
    if (!complaintsChannel) {
      complaintsChannel = supabase
        .channel('public:complaints')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'complaints' 
        }, (payload) => {
          console.log('Complaints real-time update:', payload);
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ["complaints"] });
        })
        .subscribe();
    }

    return () => {
      subscriberCount--;
      
      // Only remove channel when no more subscribers
      if (subscriberCount === 0 && complaintsChannel) {
        supabase.removeChannel(complaintsChannel);
        complaintsChannel = null;
      }
    };
  }, [queryClient]);
};

// List all complaints
export const useListComplaints = (unitId?: string, status?: string) => {
  // Temporarily disable real-time updates to test if it's causing loading issues
  // useComplaintsRealTime();

  return useQuery({
    queryKey: ["complaints", unitId, status],
    queryFn: async () => {
      console.log('🔍 Starting complaints query...');
      
      // Simplified query to test basic functionality
      let query = supabase
        .from("complaints")
        .select('*')
        .order('created_at', { ascending: false });

      if (unitId) {
        query = query.eq('unit_id', unitId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      console.log('🔍 Executing query...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching complaints:', error);
        throw error;
      }

      console.log('✅ Complaints data received:', data?.length, 'complaints');
      const mappedData = (data || []).map(mapComplaint);
      console.log('✅ Mapped complaints:', mappedData?.length, 'complaints');
      
      return mappedData;
    },
  });
};

// Get single complaint
export const useGetComplaint = (id: string) => {
  // Temporarily disable real-time updates to test if it's causing loading issues
  // useComplaintsRealTime();

  return useQuery({
    queryKey: ["complaints", id],
    queryFn: async () => {
      console.log('🔍 Starting single complaint query for ID:', id);
      
      // Simplified query to test basic functionality
      const { data, error } = await supabase
        .from("complaints")
        .select('*')
        .eq('id', id)
        .single();

      console.log('🔍 Single complaint query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching complaint:', error);
        throw error;
      }

      if (!data) {
        console.error('❌ No complaint found with ID:', id);
        throw new Error('Complaint not found');
      }

      console.log('✅ Single complaint data received:', data);
      const mappedData = mapComplaint(data);
      console.log('✅ Mapped single complaint:', mappedData);
      
      return mappedData;
    },
    enabled: !!id,
  });
};

// Create complaint
export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (newComplaint: ComplaintInsert) => {
      // Ensure both title/subject and description/details are populated
      const complaintData = {
        ...newComplaint,
        subject: newComplaint.subject || newComplaint.title || '',
        details: newComplaint.details || newComplaint.description || '',
        title: newComplaint.title || newComplaint.subject,
        description: newComplaint.description || newComplaint.details,
      };

      const created = await fetchAdmin('/admin/complaints', {
        method: 'POST',
        body: JSON.stringify(complaintData),
      });
      return mapComplaint(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
};

// Update complaint
export const useUpdateComplaint = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (updates: ComplaintUpdate) => {
      // Update both title/subject and description/details if provided
      const updateData = { ...updates };
      if (updates.title && !updates.subject) {
        updateData.subject = updates.title;
      }
      if (updates.description && !updates.details) {
        updateData.details = updates.description;
      }

      const updated = await fetchAdmin(`/admin/complaints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      return mapComplaint(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaints", id] });
    },
  });
};

// Delete complaint
export const useDeleteComplaint = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/complaints/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
};

// Additional helper hooks for metrics and statistics
export const useComplaintMetrics = () => {
  // Temporarily disable real-time updates to test if it's causing loading issues
  // useComplaintsRealTime();

  return useQuery({
    queryKey: ["complaints", "metrics"],
    queryFn: async () => {
      const { data: complaints, error } = await supabase
        .from("complaints")
        .select("status, priority, category, created_at");

      if (error) {
        console.error('Error fetching complaint metrics:', error);
        throw error;
      }

      // Calculate metrics
      const total = complaints.length;
      const pending = complaints.filter(c => c.status === 'pending').length;
      const inProgress = complaints.filter(c => c.status === 'in_progress').length;
      const resolved = complaints.filter(c => c.status === 'resolved').length;
      
      const high = complaints.filter(c => c.priority === 'high').length;
      const medium = complaints.filter(c => c.priority === 'medium').length;
      const low = complaints.filter(c => c.priority === 'low').length;

      // Category breakdown
      const categories = complaints.reduce((acc: Record<string, number>, complaint) => {
        const category = complaint.category || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // Recent complaints (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentComplaints = complaints.filter(c => 
        new Date(c.created_at || '') > sevenDaysAgo
      ).length;

      return {
        total,
        pending,
        inProgress,
        resolved,
        high,
        medium,
        low,
        categories,
        recentComplaints,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      };
    },
  });
};
