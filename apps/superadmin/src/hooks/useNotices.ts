"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";

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
  status?: string | null;
  views_count?: number | null;
  likes_count?: number | null;
  is_featured?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  communities?: {
    id?: string | null;
    name?: string | null;
  } | null;
}

export interface CreateNoticeData {
  community_id: string;
  title: string;
  body: string;
  image_url?: string | null;
  video_url?: string | null;
  tags?: string[];
  author_name?: string;
  author_avatar?: string;
  category?: string;
  priority?: string;
  status?: string;
  posted_at?: string | null;
  is_featured?: boolean;
}

export interface UpdateNoticeData extends Partial<CreateNoticeData> {
  id: string;
}

type NoticeListResponse = {
  data: Notice[];
  count: number;
};

type NoticeDetailResponse = {
  data: Notice;
};

const noticeQueryKey = ["admin-notices"] as const;

export const getNoticeStatus = (notice?: Partial<Notice> | null) => {
  const normalized = String(notice?.status || "published").trim().toLowerCase();
  return normalized || "published";
};

export const formatNoticeLabel = (value?: string | null) => {
  if (!value) return "Published";
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const transformNoticeData = (record: Notice): Notice => ({
  ...record,
  status: getNoticeStatus(record),
});

const invalidateNoticeQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: noticeQueryKey });
};

export const useListNotices = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: noticeQueryKey,
    enabled: hasToken,
    queryFn: async (): Promise<Notice[]> => {
      const response = await fetchAdmin<NoticeListResponse>("/admin/notices");
      return (response.data || []).map(transformNoticeData);
    },
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
};

export const useFeaturedNotices = () => {
  const query = useListNotices();

  return {
    ...query,
    data: (query.data || []).filter((notice) => notice.is_featured).slice(0, 3),
  };
};

export const useNoticesByTag = (tag: string) => {
  const query = useListNotices();
  const normalizedTag = tag.trim().toLowerCase();

  return {
    ...query,
    data: (query.data || []).filter((notice) =>
      normalizedTag.length > 0
        ? (notice.tags || []).some((entry) => entry.toLowerCase() === normalizedTag)
        : true
    ),
  };
};

export const useVideoNotices = () => {
  const query = useListNotices();

  return {
    ...query,
    data: (query.data || []).filter((notice) => Boolean(notice.video_url)),
  };
};

export const useGetNotice = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: [...noticeQueryKey, id],
    enabled: hasToken && Boolean(id),
    queryFn: async (): Promise<Notice> => {
      const response = await fetchAdmin<NoticeDetailResponse>(`/admin/notices/${id}`);
      return transformNoticeData(response.data);
    },
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (newNotice: CreateNoticeData): Promise<Notice> => {
      const response = await fetchAdmin<NoticeDetailResponse>("/admin/notices", {
        method: "POST",
        body: JSON.stringify(newNotice),
      });

      return transformNoticeData(response.data);
    },
    onSuccess: () => {
      invalidateNoticeQueries(queryClient);
    },
  });
};

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateNoticeData): Promise<Notice> => {
      const response = await fetchAdmin<NoticeDetailResponse>(`/admin/notices/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      return transformNoticeData(response.data);
    },
    onSuccess: (data) => {
      invalidateNoticeQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [...noticeQueryKey, data.id] });
    },
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await fetchAdmin(`/admin/notices/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      invalidateNoticeQueries(queryClient);
    },
  });
};

const readOnlyEngagementMutationMessage = "Notice engagement is read-only in the admin workspace.";

export const useIncrementNoticeViews = () =>
  useMutation({
    mutationFn: async () => {
      throw new Error(readOnlyEngagementMutationMessage);
    },
  });

export const useIncrementNoticeLikes = () =>
  useMutation({
    mutationFn: async () => {
      throw new Error(readOnlyEngagementMutationMessage);
    },
  });
