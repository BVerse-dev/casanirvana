"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";
import type { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { hydrateChatAttachments } from "@/utils/chatAttachments";

type Group = Database["public"]["Tables"]["groups"]["Row"];
type GroupMessageRow = Database["public"]["Tables"]["group_messages"]["Row"];
type ProfileSummary = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "first_name" | "last_name" | "avatar_url" | "email" | "phone"
>;

type GroupDetailRecord = Group & {
  group_members: Array<
    Database["public"]["Tables"]["group_members"]["Row"] & {
      profiles: ProfileSummary | null;
    }
  >;
};

type GroupMessageRecord = GroupMessageRow & {
  profiles: ProfileSummary | null;
};

export interface ChatGroup extends Group {
  member_count?: number;
  last_message?: string;
  last_message_time?: string | null;
  last_message_sender?: string;
  unread_count?: number;
  is_member?: boolean;
  groupName?: string;
  variant?: string;
  time?: Date | string | null;
  change?: number;
}

const groupsQueryKey = ["admin-message-groups"] as const;
const groupDetailQueryKey = (groupId?: string) => ["admin-message-group", groupId || ""] as const;
const groupMessagesQueryKey = (groupId?: string) => ["admin-message-group-messages", groupId || ""] as const;

const mapGroupSummary = (group: ChatGroup): ChatGroup => ({
  ...group,
  time: group.time ? new Date(group.time) : null,
});

export const useGroupsRealtime = () => {};

export const useListGroups = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useGroupsRealtime();

  return useQuery({
    queryKey: groupsQueryKey,
    enabled: hasToken,
    queryFn: async (): Promise<ChatGroup[]> => {
      const payload = await fetchAdmin<{ data: ChatGroup[] }>("/admin/messages/groups");
      return (payload.data || []).map(mapGroupSummary);
    },
  });
};

export const useGetGroup = (groupId: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useGroupsRealtime();

  return useQuery({
    queryKey: groupDetailQueryKey(groupId),
    enabled: hasToken && Boolean(groupId),
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: GroupDetailRecord | null }>(`/admin/messages/groups/${groupId}`);
      return payload.data;
    },
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (newGroup: { name: string; description?: string; member_ids?: string[] }) => {
      const payload = await fetchAdmin<{ data: GroupDetailRecord }>("/admin/messages/groups", {
        method: "POST",
        body: JSON.stringify(newGroup),
      });

      return payload.data;
    },
    onSuccess: (createdGroup) => {
      queryClient.invalidateQueries({ queryKey: groupsQueryKey });
      queryClient.invalidateQueries({ queryKey: groupDetailQueryKey(createdGroup?.id) });
    },
  });
};

export const useListGroupMessages = (groupId: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useGroupsRealtime();

  return useQuery({
    queryKey: groupMessagesQueryKey(groupId),
    enabled: hasToken && Boolean(groupId),
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: GroupMessageRecord[] }>(`/admin/messages/groups/${groupId}/messages`);
      return hydrateChatAttachments(supabase.storage, payload.data || []);
    },
  });
};

export const useCreateGroupMessage = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (newMessage: { group_id: string; body?: string; message_type?: string; attachments?: unknown }) => {
      const payload = await fetchAdmin<{ data: GroupMessageRecord }>(
        `/admin/messages/groups/${newMessage.group_id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            body: newMessage.body,
            attachments: newMessage.attachments ?? null,
            message_type: newMessage.message_type || "text",
          }),
        }
      );

      return payload.data;
    },
    onSuccess: (createdMessage, variables) => {
      queryClient.invalidateQueries({ queryKey: groupsQueryKey });
      queryClient.invalidateQueries({ queryKey: groupDetailQueryKey(variables.group_id) });
      queryClient.invalidateQueries({ queryKey: groupMessagesQueryKey(variables.group_id) });

      if (createdMessage?.group_id) {
        queryClient.invalidateQueries({ queryKey: groupMessagesQueryKey(createdMessage.group_id) });
      }
    },
  });
};
