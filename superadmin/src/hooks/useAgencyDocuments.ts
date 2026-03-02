'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';

export type AgencyDocument = Tables<'agency_documents'>;
export type CreateAgencyDocumentData = TablesInsert<'agency_documents'>;
export type UpdateAgencyDocumentData = TablesUpdate<'agency_documents'>;

export interface DocumentFormData {
  name: string;
  category: string;
  type: string;
  description: string;
  access: string;
  retention: string;
  status: string;
  tags: string[];
  reminderDays: number;
  isConfidential: boolean;
  requiresApproval: boolean;
  autoArchive: boolean;
}

export interface UIDocument {
  id: string;
  agencyId: string;
  name: string;
  category: string;
  type: string;
  description: string;
  fileUrl: string;
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  lastModified: string;
  expiryDate: string | null;
  access: string;
  retention: string;
  status: string;
  version: string;
  tags: string[];
  reminderDays: number;
  isConfidential: boolean;
  requiresApproval: boolean;
  autoArchive: boolean;
  downloads: number;
  views: number;
}

const QUERY_KEYS = {
  agencyDocuments: ['agency_documents'] as const,
  agencyDocument: (id: string) => ['agency_documents', id] as const,
  currentAgencyDocuments: ['agency_documents', 'current'] as const,
  agencyDocumentsByAgency: (agencyId: string) => ['agency_documents', 'agency', agencyId] as const,
  agencyDocumentsByType: (documentType: string) => ['agency_documents', 'type', documentType] as const,
  agencyDocumentsByCategory: (category: string) => ['agency_documents', 'category', category] as const,
  expiringAgencyDocuments: (days: number) => ['agency_documents', 'expiring', days] as const,
};

const formatFileSize = (bytes: number): string => {
  if (!bytes) {
    return '0 KB';
  }

  const threshold = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const sizeIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(threshold)),
    sizes.length - 1
  );

  const value = bytes / Math.pow(threshold, sizeIndex);
  return `${parseFloat(value.toFixed(1))} ${sizes[sizeIndex]}`;
};

const toDisplayDate = (value?: string | null) => {
  if (!value) {
    return new Date().toISOString().split('T')[0];
  }

  return value.includes('T') ? value.split('T')[0] : value;
};

const mapDatabaseToUI = (dbRecord: AgencyDocument): UIDocument => ({
  id: dbRecord.id,
  agencyId: dbRecord.agency_id,
  name: dbRecord.name,
  category: dbRecord.category,
  type: dbRecord.type,
  description: dbRecord.description || '',
  fileUrl: dbRecord.file_url || '',
  fileSize: formatFileSize(dbRecord.file_size || 0),
  uploadedBy: dbRecord.uploaded_by_name || 'Unassigned',
  uploadDate: toDisplayDate(dbRecord.upload_date || dbRecord.created_at),
  lastModified: toDisplayDate(dbRecord.last_modified || dbRecord.updated_at || dbRecord.created_at),
  expiryDate: dbRecord.expiry_date,
  access: dbRecord.access || 'Internal',
  retention: dbRecord.retention || '5 Years',
  status: dbRecord.status || 'Active',
  version: dbRecord.version || '1.0',
  tags: dbRecord.tags || [],
  reminderDays: dbRecord.reminder_days || 0,
  isConfidential: dbRecord.is_confidential || false,
  requiresApproval: dbRecord.requires_approval || false,
  autoArchive: dbRecord.auto_archive || false,
  downloads: dbRecord.downloads || 0,
  views: dbRecord.views || 0,
});

const parseAgencyDocumentData = (dbRecord: AgencyDocument): UIDocument =>
  mapDatabaseToUI(dbRecord);

const mapFormToCreate = (
  formData: DocumentFormData,
  agencyId: string
): CreateAgencyDocumentData => ({
  agency_id: agencyId,
  name: formData.name,
  category: formData.category,
  type: formData.type,
  description: formData.description,
  access: formData.access,
  retention: formData.retention,
  status: formData.status,
  tags: formData.tags,
  reminder_days: formData.reminderDays,
  is_confidential: formData.isConfidential,
  requires_approval: formData.requiresApproval,
  auto_archive: formData.autoArchive,
  upload_date: new Date().toISOString(),
  last_modified: new Date().toISOString(),
});

const mapFormToUpdate = (
  formData: DocumentFormData,
  agencyId: string
): UpdateAgencyDocumentData => ({
  agency_id: agencyId,
  name: formData.name,
  category: formData.category,
  type: formData.type,
  description: formData.description,
  access: formData.access,
  retention: formData.retention,
  status: formData.status,
  tags: formData.tags,
  reminder_days: formData.reminderDays,
  is_confidential: formData.isConfidential,
  requires_approval: formData.requiresApproval,
  auto_archive: formData.autoArchive,
  last_modified: new Date().toISOString(),
});

export const useListAgencyDocuments = () =>
  useQuery({
    queryKey: QUERY_KEYS.agencyDocuments,
    queryFn: async (): Promise<UIDocument[]> => {
      const { data, error } = await supabase
        .from('agency_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agency documents:', error);
        throw new Error(`Failed to fetch agency documents: ${error.message}`);
      }

      return (data || []).map(parseAgencyDocumentData);
    },
  });

export const useGetAgencyDocument = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.agencyDocument(id),
    queryFn: async (): Promise<UIDocument | null> => {
      if (!id) {
        return null;
      }

      const { data, error } = await supabase
        .from('agency_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching agency document:', error);
        throw new Error(`Failed to fetch agency document: ${error.message}`);
      }

      return data ? parseAgencyDocumentData(data) : null;
    },
    enabled: Boolean(id),
  });

export const useCreateAgencyDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      agencyId,
    }: {
      formData: DocumentFormData;
      agencyId: string;
    }): Promise<UIDocument> => {
      const payload = mapFormToCreate(formData, agencyId);

      const { data, error } = await supabase
        .from('agency_documents')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating agency document:', error);
        throw new Error(`Failed to create agency document: ${error.message}`);
      }

      return parseAgencyDocumentData(data);
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyDocuments });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.agencyDocumentsByAgency(document.agencyId),
      });
    },
  });
};

export const useUpdateAgencyDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      agencyId,
    }: {
      id: string;
      data: DocumentFormData;
      agencyId: string;
    }): Promise<UIDocument> => {
      const payload = mapFormToUpdate(data, agencyId);

      const { data: result, error } = await supabase
        .from('agency_documents')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating agency document:', error);
        throw new Error(`Failed to update agency document: ${error.message}`);
      }

      return parseAgencyDocumentData(result);
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyDocuments });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.agencyDocument(document.id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.agencyDocumentsByAgency(document.agencyId),
      });
    },
  });
};

export const useDeleteAgencyDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('agency_documents').delete().eq('id', id);

      if (error) {
        console.error('Error deleting agency document:', error);
        throw new Error(`Failed to delete agency document: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyDocuments });
    },
  });
};

export const useCurrentAgencyDocuments = () =>
  useQuery({
    queryKey: QUERY_KEYS.currentAgencyDocuments,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agency_documents')
        .select('*')
        .neq('status', 'Archived')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching current agency documents:', error);
        throw new Error(`Failed to fetch current agency documents: ${error.message}`);
      }

      return (data || []).map(parseAgencyDocumentData);
    },
  });

export const useGetAgencyDocumentsByAgency = (agencyId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.agencyDocumentsByAgency(agencyId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agency_documents')
        .select('*')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agency documents by agency:', error);
        throw new Error(`Failed to fetch agency documents: ${error.message}`);
      }

      return (data || []).map(parseAgencyDocumentData);
    },
    enabled: Boolean(agencyId),
  });

export const useGetAgencyDocumentsByType = (documentType: string) =>
  useQuery({
    queryKey: QUERY_KEYS.agencyDocumentsByType(documentType),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agency_documents')
        .select('*')
        .eq('type', documentType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agency documents by type:', error);
        throw new Error(`Failed to fetch agency documents: ${error.message}`);
      }

      return (data || []).map(parseAgencyDocumentData);
    },
    enabled: Boolean(documentType),
  });

export const useGetAgencyDocumentsByCategory = (category: string) =>
  useQuery({
    queryKey: QUERY_KEYS.agencyDocumentsByCategory(category),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agency_documents')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agency documents by category:', error);
        throw new Error(`Failed to fetch agency documents: ${error.message}`);
      }

      return (data || []).map(parseAgencyDocumentData);
    },
    enabled: Boolean(category),
  });

export const useGetExpiringAgencyDocuments = (days = 30) =>
  useQuery({
    queryKey: QUERY_KEYS.expiringAgencyDocuments(days),
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from('agency_documents')
        .select('*')
        .not('expiry_date', 'is', null)
        .lte('expiry_date', futureDate.toISOString())
        .neq('status', 'Archived')
        .order('expiry_date', { ascending: true });

      if (error) {
        console.error('Error fetching expiring agency documents:', error);
        throw new Error(`Failed to fetch expiring agency documents: ${error.message}`);
      }

      return (data || []).map(parseAgencyDocumentData);
    },
  });

export const useArchiveAgencyDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; archivedBy?: string }) => {
      const { data, error } = await supabase
        .from('agency_documents')
        .update({
          status: 'Archived',
          last_modified: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error archiving agency document:', error);
        throw new Error(`Failed to archive agency document: ${error.message}`);
      }

      return parseAgencyDocumentData(data);
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyDocuments });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.agencyDocument(document.id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.currentAgencyDocuments,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.agencyDocumentsByAgency(document.agencyId),
      });
    },
  });
};

export const useTrackAgencyDocumentDownload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: currentDocument, error: fetchError } = await supabase
        .from('agency_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching agency document for download tracking:', fetchError);
        throw new Error(`Failed to track document download: ${fetchError.message}`);
      }

      const nextDownloads = (currentDocument.downloads || 0) + 1;
      const nextViews = Math.max(currentDocument.views || 0, nextDownloads);

      const { data, error } = await supabase
        .from('agency_documents')
        .update({
          downloads: nextDownloads,
          views: nextViews,
          last_modified: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error tracking agency document download:', error);
        throw new Error(`Failed to track document download: ${error.message}`);
      }

      return parseAgencyDocumentData(data);
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.agencyDocument(document.id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyDocuments });
    },
  });
};

export const useBulkUpdateAgencyDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Array<{ id: string; data: DocumentFormData; agencyId: string }>
    ) => {
      const results: UIDocument[] = [];

      for (const update of updates) {
        const { data, error } = await supabase
          .from('agency_documents')
          .update(mapFormToUpdate(update.data, update.agencyId))
          .eq('id', update.id)
          .select('*')
          .single();

        if (error) {
          console.error('Error in bulk agency document update:', error);
          throw new Error(`Failed to update some agency documents: ${error.message}`);
        }

        results.push(parseAgencyDocumentData(data));
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyDocuments });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.currentAgencyDocuments,
      });
    },
  });
};
