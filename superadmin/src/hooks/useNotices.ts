import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Notice {
  id: string;
  community_id: string | null;
  title: string;
  body: string;
  posted_at: string | null;
  image_url?: string | null;
  video_url?: string | null;
  tags?: string[] | null;
  author_name?: string | null;
  author_avatar?: string | null;
  category?: string | null;
  priority?: string | null;
  views_count?: number | null;
  likes_count?: number | null;
  is_featured?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateNoticeData {
  community_id: string;
  title: string;
  body: string;
  image_url?: string;
  video_url?: string;
  tags?: string[];
  author_name?: string;
  author_avatar?: string;
  category?: string;
  priority?: string;
  is_featured?: boolean;
}

export interface UpdateNoticeData extends Partial<CreateNoticeData> {
  id: string;
  views_count?: number;
  likes_count?: number;
}

// Transform database row to interface format
const transformNoticeData = (dbRow: any): Notice => ({
  ...dbRow,
  community_id: dbRow.community_id, // Map community_id to community_id
});

// Transform interface data to database format
const transformToDbFormat = (noticeData: CreateNoticeData | UpdateNoticeData): any => ({
  ...noticeData,
  community_id: (noticeData as any).community_id, // Map community_id to community_id for database
});

// List all notices
export const useListNotices = () => {
  return useQuery({
    queryKey: ['notices'],
    queryFn: async (): Promise<Notice[]> => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('posted_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch notices: ${error.message}`);
      }

      return data || [];
    },
  });
};

// Get featured notices (using is_featured field)
export const useFeaturedNotices = () => {
  return useQuery({
    queryKey: ['notices', 'featured'],
    queryFn: async (): Promise<Notice[]> => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_featured', true)
        .order('posted_at', { ascending: false })
        .limit(3);

      if (error) {
        throw new Error(`Failed to fetch featured notices: ${error.message}`);
      }

      return data || [];
    },
  });
};

// Get notices by tag
export const useNoticesByTag = (tag: string) => {
  return useQuery({
    queryKey: ['notices', 'tag', tag],
    queryFn: async (): Promise<Notice[]> => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .contains('tags', [tag])
        .order('posted_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch notices by tag: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!tag,
  });
};

// Get video notices (for Posts component)
export const useVideoNotices = () => {
  return useQuery({
    queryKey: ['notices', 'video'],
    queryFn: async (): Promise<Notice[]> => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .not('video_url', 'is', null)
        .order('posted_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch video notices: ${error.message}`);
      }

      return data || [];
    },
  });
};

// Get single notice by ID
export const useGetNotice = (id: string) => {
  return useQuery({
    queryKey: ['notices', id],
    queryFn: async (): Promise<Notice> => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch notice: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create notice
export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newNotice: CreateNoticeData): Promise<Notice> => {
      const dbData = transformToDbFormat(newNotice);
      const { data, error } = await supabase
        .from('notices')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create notice: ${error.message}`);
      }

      return transformNoticeData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

// Update notice
export const useUpdateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateNoticeData): Promise<Notice> => {
      const dbData = transformToDbFormat(updateData);
      const { data, error } = await supabase
        .from('notices')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update notice: ${error.message}`);
      }

      return transformNoticeData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['notices', data.id] });
    },
  });
};

// Delete notice
export const useDeleteNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete notice: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

// Increment view count
export const useIncrementNoticeViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.rpc('increment_notice_views' as any, {
        notice_id: id
      });

      if (error) {
        throw new Error(`Failed to increment views: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

// Increment like count
export const useIncrementNoticeLikes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.rpc('increment_notice_likes' as any, {
        notice_id: id
      });

      if (error) {
        throw new Error(`Failed to increment likes: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};
