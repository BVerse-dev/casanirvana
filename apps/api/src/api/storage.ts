import { supabase } from '../lib/supabase';

export enum StorageBucket {
  AVATARS = 'avatars',
  DOCUMENTS = 'documents',
  COMPLAINT_ATTACHMENTS = 'complaint-attachments',
  MAINTENANCE_ATTACHMENTS = 'maintenance-attachments',
  SPLASH_IMAGES = 'splash-images'
}

// Upload file to a specific bucket
export const uploadFile = async (
  bucket: StorageBucket,
  file: File,
  path?: string
): Promise<{ data: { path: string; url: string } | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const fileExt = file.name.split('.').pop();
  const fileName = path || `${userData.user?.id}-${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) return { data: null, error };
  
  const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
  
  return { 
    data: { 
      path: data.path,
      url
    }, 
    error: null 
  };
};

// Download a file from a bucket
export const getFileUrl = (bucket: StorageBucket, path: string): string => {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};

// List files in a bucket
export const listFiles = async (
  bucket: StorageBucket,
  path?: string
): Promise<{ data: any[] | null; error: any }> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path || '');
  
  return { data, error };
};

// Delete file from a bucket
export const deleteFile = async (
  bucket: StorageBucket,
  path: string
): Promise<{ error: any }> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  return { error };
};