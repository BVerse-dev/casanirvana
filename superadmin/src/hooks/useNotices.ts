"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

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
    name?: string | null;
  } | null;
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
  status?: string;
  posted_at?: string | null;
  is_featured?: boolean;
}

export interface UpdateNoticeData extends Partial<CreateNoticeData> {
  id: string;
  views_count?: number;
  likes_count?: number;
}

let noticesChannel: ReturnType<typeof supabase.channel> | null = null;
let noticesSubscriberCount = 0;

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

const transformNoticeData = (dbRow: any): Notice => ({
  ...dbRow,
  status: getNoticeStatus(dbRow),
});

const transformToDbFormat = (noticeData: CreateNoticeData | UpdateNoticeData) => {
  const normalizedStatus = String(noticeData.status || "published").toLowerCase();
  const shouldSetPostedAt = normalizedStatus === "published";

  return {
    ...noticeData,
    status: normalizedStatus,
    posted_at: shouldSetPostedAt ? noticeData.posted_at || new Date().toISOString() : noticeData.posted_at || null,
  };
};

const useNoticesRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    noticesSubscriberCount += 1;

    if (!noticesChannel) {
      noticesChannel = supabase
        .channel("superadmin-notices")
        .on("postgres_changes", { event: "*", schema: "public", table: "notices" }, () => {
          queryClient.invalidateQueries({ queryKey: ["notices"] });
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
          queryClient.invalidateQueries({ queryKey: ["comments"] });
        })
        .subscribe();
    }

    return () => {
      noticesSubscriberCount -= 1;

      if (noticesSubscriberCount <= 0 && noticesChannel) {
        supabase.removeChannel(noticesChannel);
        noticesChannel = null;
        noticesSubscriberCount = 0;
      }
    };
  }, [queryClient]);
};

const NOTICE_SELECT = `
  *,
  communities:community_id(name)
`;

export const useListNotices = () => {
  useNoticesRealtime();

  return useQuery({
    queryKey: ["notices"],
    queryFn: async (): Promise<Notice[]> => {
      const { data, error } = await supabase.from("notices").select(NOTICE_SELECT).order("posted_at", { ascending: false });
      if (error) {
        throw new Error(`Failed to fetch notices: ${error.message}`);
      }
      return (data || []).map(transformNoticeData);
    },
  });
};

export const useFeaturedNotices = () => {
  useNoticesRealtime();

  return useQuery({
    queryKey: ["notices", "featured"],
    queryFn: async (): Promise<Notice[]> => {
      const { data, error } = await supabase
        .from("notices")
        .select(NOTICE_SELECT)
        .eq("is_featured", true)
        .order("posted_at", { ascending: false })
        .limit(3);

      if (error) {
        throw new Error(`Failed to fetch featured notices: ${error.message}`);
      }

      return (data || []).map(transformNoticeData);
    },
  });
};

export const useNoticesByTag = (tag: string) => {
  useNoticesRealtime();

  return useQuery({
    queryKey: ["notices", "tag", tag],
    queryFn: async (): Promise<Notice[]> => {
      const { data, error } = await supabase
        .from("notices")
        .select(NOTICE_SELECT)
        .contains("tags", [tag])
        .order("posted_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch notices by tag: ${error.message}`);
      }

      return (data || []).map(transformNoticeData);
    },
    enabled: Boolean(tag),
  });
};

export const useVideoNotices = () => {
  useNoticesRealtime();

  return useQuery({
    queryKey: ["notices", "video"],
    queryFn: async (): Promise<Notice[]> => {
      const { data, error } = await supabase
        .from("notices")
        .select(NOTICE_SELECT)
        .not("video_url", "is", null)
        .order("posted_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch video notices: ${error.message}`);
      }

      return (data || []).map(transformNoticeData);
    },
  });
};

export const useGetNotice = (id: string) => {
  useNoticesRealtime();

  return useQuery({
    queryKey: ["notices", id],
    queryFn: async (): Promise<Notice> => {
      const { data, error } = await supabase.from("notices").select(NOTICE_SELECT).eq("id", id).single();
      if (error) {
        throw new Error(`Failed to fetch notice: ${error.message}`);
      }
      return transformNoticeData(data);
    },
    enabled: Boolean(id),
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newNotice: CreateNoticeData): Promise<Notice> => {
      const dbData = transformToDbFormat(newNotice);
      const { data, error } = await supabase.from("notices").insert([dbData]).select(NOTICE_SELECT).single();
      if (error) {
        throw new Error(`Failed to create notice: ${error.message}`);
      }
      return transformNoticeData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
};

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateNoticeData): Promise<Notice> => {
      const dbData = transformToDbFormat(updateData);
      const { data, error } = await supabase.from("notices").update(dbData).eq("id", id).select(NOTICE_SELECT).single();
      if (error) {
        throw new Error(`Failed to update notice: ${error.message}`);
      }
      return transformNoticeData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notices", data.id] });
    },
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) {
        throw new Error(`Failed to delete notice: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
};

export const useIncrementNoticeViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, currentCount = 0 }: { id: string; currentCount?: number | null }): Promise<void> => {
      const { error } = await supabase.from("notices").update({ views_count: Number(currentCount || 0) + 1 }).eq("id", id);
      if (error) {
        throw new Error(`Failed to increment views: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
};

export const useIncrementNoticeLikes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, currentCount = 0 }: { id: string; currentCount?: number | null }): Promise<void> => {
      const { error } = await supabase.from("notices").update({ likes_count: Number(currentCount || 0) + 1 }).eq("id", id);
      if (error) {
        throw new Error(`Failed to increment likes: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
};
