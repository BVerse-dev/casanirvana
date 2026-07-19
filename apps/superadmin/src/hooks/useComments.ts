import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";

export interface Comment {
  id: string;
  notice_id: string;
  author_name: string;
  author_avatar?: string | null;
  author_user_id?: string | null;
  content: string;
  likes_count?: number | null;
  created_at: string;
  updated_at?: string | null;
  parent_id?: string | null;
  replies?: Comment[];
}

export interface CreateCommentData {
  notice_id: string;
  content: string;
  parent_id?: string | null;
  author_name?: string;
  author_avatar?: string | null;
}

export interface UpdateCommentData extends Partial<CreateCommentData> {
  id: string;
}

type CommentsResponse = {
  data: Comment[];
};

type CommentResponse = {
  data: Comment;
};

const commentsQueryKey = (noticeId: string) => ["admin-notice-comments", noticeId] as const;

export const useListComments = (noticeId: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: commentsQueryKey(noticeId),
    enabled: hasToken && Boolean(noticeId),
    queryFn: async (): Promise<Comment[]> => {
      const response = await fetchAdmin<CommentsResponse>(`/admin/notices/${noticeId}/comments`);
      return response.data || [];
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({ notice_id, content, parent_id }: CreateCommentData): Promise<Comment> => {
      const response = await fetchAdmin<CommentResponse>(`/admin/notices/${notice_id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, parent_id: parent_id || null }),
      });

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey(data.notice_id) });
    },
  });
};

const useReadOnlyMutation = (message: string) =>
  useMutation({
    mutationFn: async () => {
      throw new Error(message);
    },
  });

export const useUpdateComment = () => useReadOnlyMutation("Notice comments cannot be edited from the admin workspace.");

export const useDeleteComment = () => useReadOnlyMutation("Notice comments cannot be deleted from the admin workspace.");

export const useIncrementCommentLikes = () => useReadOnlyMutation("Notice comment likes are read-only in the admin workspace.");
