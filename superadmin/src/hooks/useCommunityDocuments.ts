'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types
export interface CommunityDocument {
  id: string;
  community_id: string;
  community_name?: string;
  document_type: 'legal' | 'financial' | 'administrative' | 'compliance' | 'maintenance' | 'insurance' | 'contracts' | 'meeting_minutes';
  category: string;
  title?: string;
  description?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  file_url?: string;
  version?: string;
  is_confidential?: boolean;
  access_level: 'public' | 'residents' | 'committee' | 'admin_only';
  expiry_date?: string;
  upload_date?: string;
  uploaded_by?: string;
  tags?: string[];
  status: 'active' | 'archived' | 'expired' | 'draft';
  approval_required?: boolean;
  approved_by?: string;
  approval_date?: string;
  created_at: string;
  updated_at: string;
  // Legacy fields from existing table
  name?: string;
  type?: string;
}

export interface DocumentCategory {
  id: string;
  type: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  required_docs: string[];
  created_at: string;
}

// Query Keys
const QUERY_KEYS = {
  communityDocuments: ['community_documents'] as const,
  communityDocument: (id: string) => ['community_documents', id] as const,
  communityDocumentsByCommunity: (communityId: string) => ['community_documents', 'community', communityId] as const,
  communityDocumentsByType: (documentType: string) => ['community_documents', 'type', documentType] as const,
  communityDocumentsByCategory: (category: string) => ['community_documents', 'category', category] as const,
  currentCommunityDocuments: ['community_documents', 'current'] as const,
  expiringCommunityDocuments: (days: number) => ['community_documents', 'expiring', days] as const,
};

// Hooks

// List all community documents
export const useCommunityDocuments = () => {
  return useQuery({
    queryKey: ['community_documents'],
    queryFn: async (): Promise<CommunityDocument[]> => {
      const { data, error } = await supabase
        .from('community_documents' as any)
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch community documents: ${error.message}`);
      }

      return (data as unknown as CommunityDocument[]) || [];
    },
  });
};

// Get current community documents (not archived)
export const useCurrentCommunityDocuments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.currentCommunityDocuments,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_documents' as any)
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch current community documents: ${error.message}`);
      }

      return (data as unknown as CommunityDocument[]) || [];
    },
  });
};

// Get community document by ID
export const useGetCommunityDocument = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.communityDocument(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_documents' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch community document: ${error.message}`);
      }

      return data as unknown as CommunityDocument;
    },
    enabled: !!id,
  });
};

// Get community documents by community
export const useGetCommunityDocumentsByCommunity = (communityId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.communityDocumentsByCommunity(communityId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_documents' as any)
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch community documents: ${error.message}`);
      }

      return (data as unknown as CommunityDocument[]) || [];
    },
    enabled: !!communityId,
  });
};

// Get community documents by type
export const useGetCommunityDocumentsByType = (documentType: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.communityDocumentsByType(documentType),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_documents' as any)
        .select('*')
        .eq('document_type', documentType)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch community documents: ${error.message}`);
      }

      return (data as unknown as CommunityDocument[]) || [];
    },
    enabled: !!documentType,
  });
};

// Get community documents by category
export const useGetCommunityDocumentsByCategory = (category: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.communityDocumentsByCategory(category),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_documents' as any)
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch community documents: ${error.message}`);
      }

      return (data as unknown as CommunityDocument[]) || [];
    },
    enabled: !!category,
  });
};

// Get expiring community documents
export const useGetExpiringCommunityDocuments = (days: number = 30) => {
  return useQuery({
    queryKey: QUERY_KEYS.expiringCommunityDocuments(days),
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from('community_documents' as any)
        .select('*')
        .not('expiry_date', 'is', null)
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .eq('status', 'active')
        .order('expiry_date');

      if (error) {
        throw new Error(`Failed to fetch expiring community documents: ${error.message}`);
      }

      return (data as unknown as CommunityDocument[]) || [];
    },
  });
};

// CRUD operations are in separate files

export const useDocumentCategories = () => {
  return useQuery({
    queryKey: ['document_categories'],
    queryFn: async (): Promise<DocumentCategory[]> => {
      const { data, error } = await supabase
        .from('document_categories' as any)
        .select('*')
        .order('type', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch document categories: ${error.message}`);
      }

      return (data as unknown as DocumentCategory[]) || [];
    },
  });
};
