"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";
import type { Database } from "@/lib/database.types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export type CreateAdminMessageInput = {
  to_user: string;
  body?: string;
  content?: string | null;
  attachments?: unknown;
  message_type?: MessageRow["message_type"];
  reply_to_id?: string | null;
};

export type UpdateAdminMessageInput = Partial<
  Pick<
    MessageRow,
    "body" | "content" | "attachments" | "message_type" | "read" | "is_read" | "read_at" | "message_status" | "delivered_at" | "reply_to_id"
  >
>;

export interface MessageStats {
  totalMessages: number;
  activeChats: number;
  unreadMessages: number;
  onlineUsers: number;
}

type MessageStatsPayload = {
  data: MessageStats;
};

type MessageConversationPayload = {
  data: MessageRow[];
};

const conversationQueryKey = (profileId?: string) =>
  ["admin-message-conversation", profileId || ""] as const;
const statsQueryKey = ["admin-message-stats"] as const;

export const useMessagesRealTime = () => {};

export const useListMessages = (_fromUser?: string, toUser?: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useMessagesRealTime();

  return useQuery({
    queryKey: conversationQueryKey(toUser),
    enabled: hasToken && Boolean(toUser),
    queryFn: async () => {
      if (!toUser) {
        return [] as MessageRow[];
      }

      const payload = await fetchAdmin<MessageConversationPayload>(`/admin/messages/conversations/${toUser}`);
      return payload.data || [];
    },
  });
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (newMessage: CreateAdminMessageInput) =>
      fetchAdmin<MessageRow>("/admin/messages", {
        method: "POST",
        body: JSON.stringify(newMessage),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statsQueryKey });
      queryClient.invalidateQueries({ queryKey: ["admin-message-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-message-contact", variables.to_user] });
      queryClient.invalidateQueries({ queryKey: conversationQueryKey(variables.to_user) });
    },
  });
};

export const useUpdateMessage = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (updates: UpdateAdminMessageInput) =>
      fetchAdmin<MessageRow>(`/admin/messages/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: statsQueryKey });
      queryClient.invalidateQueries({ queryKey: ["admin-message-contacts"] });

      if (updated?.from_user) {
        queryClient.invalidateQueries({ queryKey: ["admin-message-contact", updated.from_user] });
      }

      if (updated?.to_user) {
        queryClient.invalidateQueries({ queryKey: ["admin-message-contact", updated.to_user] });
        queryClient.invalidateQueries({ queryKey: conversationQueryKey(updated.to_user) });
      }

      if (updated?.from_user) {
        queryClient.invalidateQueries({ queryKey: conversationQueryKey(updated.from_user) });
      }
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/messages/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statsQueryKey });
      queryClient.invalidateQueries({ queryKey: ["admin-message-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-message-conversation"] });
    },
  });
};

export const useMessageStats = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useMessagesRealTime();

  return useQuery({
    queryKey: statsQueryKey,
    enabled: hasToken,
    queryFn: async (): Promise<MessageStats> => {
      const payload = await fetchAdmin<MessageStatsPayload>("/admin/messages/stats");
      return payload.data || {
        totalMessages: 0,
        activeChats: 0,
        unreadMessages: 0,
        onlineUsers: 0,
      };
    },
  });
};
