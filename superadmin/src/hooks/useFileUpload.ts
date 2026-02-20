'use client';

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export enum StorageBucket {
  AVATARS = 'avatars',
  DOCUMENTS = 'documents',
  COMPLAINT_ATTACHMENTS = 'complaint-attachments',
  MAINTENANCE_ATTACHMENTS = 'maintenance-attachments',
  SPLASH_IMAGES = 'splash-images'
}

// Upload file to Supabase storage
export const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({
      file,
      bucket,
      path
    }: {
      file: File;
      bucket: StorageBucket;
      path?: string;
    }): Promise<{ path: string; url: string }> => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const fileExt = file.name.split('.').pop();
      const fileName = path || `${userData.user?.id}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      return { 
        path: data.path,
        url: publicUrl
      };
    },
  });
};

// Delete file from Supabase storage
export const useDeleteFile = () => {
  return useMutation({
    mutationFn: async ({
      bucket,
      path
    }: {
      bucket: StorageBucket;
      path: string;
    }): Promise<void> => {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) throw error;
    },
  });
};

// Get public URL for a file
export const getFileUrl = (bucket: StorageBucket, path: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return publicUrl;
};
