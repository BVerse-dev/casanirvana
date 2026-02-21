import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Comment {
  id: string;
  notice_id: string;
  author_name: string;
  author_avatar?: string | null;
  content: string;
  likes_count?: number | null;
  created_at: string;
  updated_at?: string | null;
  parent_id?: string | null; // This should match the database column name
  replies?: Comment[]; // Add replies array
}

export interface CreateCommentData {
  notice_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  parent_id?: string;
}

export interface UpdateCommentData extends Partial<CreateCommentData> {
  id: string;
}

// List comments for a notice
export const useListComments = (noticeId: string) => {
  return useQuery({
    queryKey: ['comments', noticeId],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('notice_id', noticeId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch comments: ${error.message}`);
      }

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies, error: repliesError } = await supabase
            .from('comments')
            .select('*')
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          if (repliesError) {
            console.error('Failed to fetch replies:', repliesError);
            return { ...comment, replies: [] };
          }

          return { ...comment, replies: replies || [] };
        })
      );

      return commentsWithReplies;
    },
    enabled: !!noticeId,
  });
};

// Create comment
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newComment: CreateCommentData): Promise<Comment> => {
      const { data, error } = await supabase
        .from('comments')
        .insert([newComment])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create comment: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.notice_id] });
    },
  });
};

// Update comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateCommentData): Promise<Comment> => {
      const { data, error } = await supabase
        .from('comments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update comment: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.notice_id] });
    },
  });
};

// Delete comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, noticeId }: { id: string; noticeId: string }): Promise<void> => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete comment: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.noticeId] });
    },
  });
};

// Increment comment likes
export const useIncrementCommentLikes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, noticeId }: { id: string; noticeId: string }): Promise<void> => {
      const { data: currentComment, error: fetchError } = await supabase
        .from('comments')
        .select('likes_count')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to load comment likes: ${fetchError.message}`);
      }

      const nextLikesCount = (currentComment?.likes_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('comments')
        .update({ likes_count: nextLikesCount })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Failed to increment comment likes: ${updateError.message}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.noticeId] });
    },
  });
};
