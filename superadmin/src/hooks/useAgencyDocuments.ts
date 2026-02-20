'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';

// Use the actual database type
export type AgencyDocument = Tables<'agency_documents'>;
export type CreateAgencyDocumentData = TablesInsert<'agency_documents'>;
export type UpdateAgencyDocumentData = TablesUpdate<'agency_documents'>;

// Document form data interface (matching UI exactly)
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

// UI Document interface (matching the sample data structure)
export interface UIDocument {
  id: string;
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

// Helper function to convert database record to UI format
const mapDatabaseToUI = (dbRecord: AgencyDocument): UIDocument => {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
    category: dbRecord.category,
    type: dbRecord.type,
    description: dbRecord.description || '',
    fileUrl: dbRecord.file_url || '',
    fileSize: dbRecord.file_size ? formatFileSize(dbRecord.file_size) : '0 KB',
    uploadedBy: 'Unknown', // Will be populated from UI
    uploadDate: dbRecord.upload_date || new Date().toISOString().split('T')[0],
    lastModified: dbRecord.last_modified || new Date().toISOString().split('T')[0],
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
  };
};

// Helper function to convert UI form data to database format
const mapUIToDatabase = (formData: DocumentFormData): CreateAgencyDocumentData => {
  return {
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
    agency_id: 'cba1d1ff-0ff1-415b-a6c2-c47a5467996a', // Default agency ID
  };
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// List all agency documents (returns UI format)
export const useListAgencyDocuments = () => {
  return useQuery({
    queryKey: ['agency_documents'],
    queryFn: async (): Promise<UIDocument[]> => {
      const { data, error } = await supabase
        .from('agency_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agency documents:', error);
        throw new Error(`Failed to fetch agency documents: ${error.message}`);
      }

      return (data || []).map(mapDatabaseToUI);
    },
  });
};

// Get a single agency document (returns UI format)
export const useGetAgencyDocument = (id: string) => {
  return useQuery({
    queryKey: ['agency_documents', id],
    queryFn: async (): Promise<UIDocument | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('agency_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching agency document:', error);
        throw new Error(`Failed to fetch agency document: ${error.message}`);
      }

      return data ? mapDatabaseToUI(data) : null;
    },
    enabled: !!id,
  });
};

// Create a new agency document
export const useCreateAgencyDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: DocumentFormData): Promise<UIDocument> => {
      const dbData = mapUIToDatabase(formData);
      
      const { data: result, error } = await supabase
        .from('agency_documents')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('Error creating agency document:', error);
        throw new Error(`Failed to create agency document: ${error.message}`);
      }

      return mapDatabaseToUI(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency_documents'] });
    },
  });
};

// Update an agency document
export const useUpdateAgencyDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DocumentFormData }): Promise<UIDocument> => {
      const dbData = mapUIToDatabase(data);
      
      const { data: result, error } = await supabase
        .from('agency_documents')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating agency document:', error);
        throw new Error(`Failed to update agency document: ${error.message}`);
      }

      return mapDatabaseToUI(result);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agency_documents'] });
      queryClient.invalidateQueries({ queryKey: ['agency_documents', data.id] });
    },
  });
};

// Delete an agency document
export const useDeleteAgencyDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('agency_documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting agency document:', error);
        throw new Error(`Failed to delete agency document: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency_documents'] });
    },
  });
};

// Get current agency documents (not archived)
export const useCurrentAgencyDocuments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.currentAgencyDocuments,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agency_documents')
        .select(`
          *,
          agency:agencies(id, name, agency_type, contact_person, email, phone),
          uploader:profiles!agency_documents_uploaded_by_fkey(id, first_name, last_name, email)
        `)
        .eq('is_archived', false)
        .eq('is_current', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching current agency documents:', error);
        throw new Error(`Failed to fetch current agency documents: ${error.message}`);
      }

      return data?.map(parseAgencyDocumentData) || [];
    },
  });
};

// Get agency documents by agency
export const useGetAgencyDocumentsByAgency = (agencyId: string) => {
  return useQuery({
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

      return data?.map(parseAgencyDocumentData) || [];
    },
    enabled: !!agencyId,
  });
};

// Get agency documents by type
export const useGetAgencyDocumentsByType = (documentType: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.agencyDocumentsByType(documentType),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agency_documents')
        .select(`
          *,
          agency:agencies(id, name, agency_type, contact_person, email, phone)
        `)
        .eq('type', documentType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agency documents by type:', error);
        throw new Error(`Failed to fetch agency documents: ${error.message}`);
      }

      return data?.map(parseAgencyDocumentData) || [];
    },
    enabled: !!documentType,
  });
};

// Get agency documents by category
export const useGetAgencyDocumentsByCategory = (category: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.agencyDocumentsByCategory(category),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agency_documents')
        .select(`
          *,
          agency:agencies(id, name, agency_type, contact_person, email, phone)
        `)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agency documents by category:', error);
        throw new Error(`Failed to fetch agency documents: ${error.message}`);
      }

      return data?.map(parseAgencyDocumentData) || [];
    },
    enabled: !!category,
  });
};

// Get expiring agency documents
export const useGetExpiringAgencyDocuments = (days: number = 30) => {
  return useQuery({
    queryKey: QUERY_KEYS.expiringAgencyDocuments(days),
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from('agency_documents')
        .select(`
          *,
          agency:agencies(id, name, agency_type, contact_person, email, phone),
          uploader:profiles!agency_documents_uploaded_by_fkey(id, first_name, last_name, email)
        `)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', futureDate.toISOString())
        .eq('is_archived', false)
        .eq('is_current', true)
        .order('expiry_date');

      if (error) {
        console.error('Error fetching expiring agency documents:', error);
        throw new Error(`Failed to fetch expiring agency documents: ${error.message}`);
      }

      return data?.map(parseAgencyDocumentData) || [];
    },
  });
};

// Archive agency document
export const useArchiveAgencyDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, archivedBy }: { id: string; archivedBy: string }) => {
      const { data, error } = await supabase
        .from('agency_documents')
        .update({ 
          is_archived: true,
          archived_date: new Date().toISOString(),
          archived_by: archivedBy
        })
        .eq('id', id)
        .select(`
          *,
          agency:agencies(id, name, agency_type, contact_person, email, phone),
          uploader:profiles!agency_documents_uploaded_by_fkey(id, first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error('Error archiving agency document:', error);
        throw new Error(`Failed to archive agency document: ${error.message}`);
      }

      return parseAgencyDocumentData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyDocuments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyDocument(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentAgencyDocuments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyDocumentsByAgency(data.agency_id) });
    },
  });
};

// Track document download
export const useTrackAgencyDocumentDownload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('agency_documents')
        .update({ 
          download_count: supabase.raw('download_count + 1'),
          last_accessed: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error tracking agency document download:', error);
        throw new Error(`Failed to track document download: ${error.message}`);
      }

      return parseAgencyDocumentData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyDocument(data.id) });
    },
  });
};

// Bulk update agency documents
export const useBulkUpdateAgencyDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; data: DocumentFormData }>) => {
      const promises = updates.map(({ id, data }) =>
        supabase
          .from('agency_documents')
          .update(data)
          .eq('id', id)
          .select(`
            *,
            agency:agencies(id, name, agency_type, contact_person, email, phone),
            uploader:profiles!agency_documents_uploaded_by_fkey(id, first_name, last_name, email)
          `)
          .single()
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Errors in bulk update:', errors);
        throw new Error(`Failed to update some agency documents`);
      }

      return results.map(result => parseAgencyDocumentData(result.data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agencyDocuments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentAgencyDocuments });
    },
  });
};
