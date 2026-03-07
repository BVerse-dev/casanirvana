"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";
import { hydrateChatAttachments } from "@/utils/chatAttachments";

type Group = Database["public"]["Tables"]["groups"]["Row"];
type GroupUpdate = Database["public"]["Tables"]["groups"]["Update"];
type GroupMessageInsert = Database["public"]["Tables"]["group_messages"]["Insert"];

export interface ChatGroup extends Group {
  member_count?: number;
  last_message?: string;
  last_message_time?: string;
  last_message_sender?: string;
  unread_count?: number;
  is_member?: boolean;
  groupName?: string;
  variant?: string;
  time?: Date;
  change?: number;
}

let groupsChannel: ReturnType<typeof supabase.channel> | null = null;
let groupsSubscriberCount = 0;

const useGroupsRealtimeSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    groupsSubscriberCount += 1;

    if (!groupsChannel) {
      groupsChannel = supabase
        .channel("superadmin-groups")
        .on("postgres_changes", { event: "*", schema: "public", table: "groups" }, () => {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "group_members" }, () => {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "group_messages" }, () => {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
          queryClient.invalidateQueries({ queryKey: ["groupMessages"] });
        })
        .subscribe();
    }

    return () => {
      groupsSubscriberCount -= 1;

      if (groupsSubscriberCount <= 0 && groupsChannel) {
        supabase.removeChannel(groupsChannel);
        groupsChannel = null;
        groupsSubscriberCount = 0;
      }
    };
  }, [queryClient]);
};

const normalizeReadBy = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  if (value && typeof value === "object" && "users" in (value as Record<string, unknown>)) {
    const users = (value as Record<string, unknown>).users;
    return Array.isArray(users) ? users.filter((entry): entry is string => typeof entry === "string") : [];
  }

  return [];
};

export const useListGroups = () => {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  useGroupsRealtimeSubscription();

  return useQuery({
    queryKey: ["groups", currentUserId || "anonymous"],
    queryFn: async (): Promise<ChatGroup[]> => {
      if (!currentUserId) return [];

      const { data: memberGroups, error: memberError } = await supabase
        .from("group_members")
        .select(`
          group_id,
          groups (
            id,
            name,
            description,
            avatar_url,
            created_at,
            created_by,
            is_active,
            updated_at
          )
        `)
        .eq("user_id", currentUserId)
        .eq("is_active", true);

      if (memberError) throw memberError;

      const groups = await Promise.all(
        (memberGroups || []).map(async (member: any) => {
          const group = member.groups as Group | null;
          if (!group) return null;

          const { count: memberCount } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id)
            .eq("is_active", true);

          const { data: lastMessage } = await supabase
            .from("group_messages")
            .select(`
              body,
              sent_at,
              from_user,
              message_type,
              read_by,
              profiles!group_messages_from_user_fkey (
                first_name,
                last_name
              )
            `)
            .eq("group_id", group.id)
            .eq("is_active", true)
            .order("sent_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: unreadRows } = await supabase
            .from("group_messages")
            .select("id, read_by")
            .eq("group_id", group.id)
            .eq("is_active", true);

          const unreadCount = (unreadRows || []).filter((row) => !normalizeReadBy(row.read_by).includes(currentUserId)).length;

          let lastMessageText = "No messages yet";
          let lastMessageSender = "";

          if (lastMessage) {
            const senderProfile = lastMessage.profiles && typeof lastMessage.profiles === "object" && !("message" in lastMessage.profiles)
              ? (lastMessage.profiles as { first_name?: string | null; last_name?: string | null })
              : null;
            const senderName = [senderProfile?.first_name, senderProfile?.last_name].filter(Boolean).join(" ").trim() || "Unknown";

            lastMessageSender = lastMessage.from_user === currentUserId ? "You" : senderName;
            lastMessageText =
              lastMessage.message_type === "file"
                ? `Shared a file${lastMessage.body ? `: ${lastMessage.body}` : ""}`
                : lastMessage.message_type === "video_call"
                  ? "Started a call"
                  : lastMessage.body || "Message sent";
          }

          return {
            ...group,
            member_count: memberCount || 0,
            last_message: lastMessageText,
            last_message_time: lastMessage?.sent_at || group.updated_at || group.created_at,
            last_message_sender: lastMessageSender,
            unread_count: unreadCount,
            is_member: true,
            groupName: group.name,
            variant: "primary",
            time: new Date(lastMessage?.sent_at || group.updated_at || group.created_at || Date.now()),
            change: unreadCount,
          } satisfies ChatGroup;
        }),
      );

      return groups
        .filter((group): group is ChatGroup => Boolean(group))
        .sort((left, right) => (right.time?.getTime() || 0) - (left.time?.getTime() || 0));
    },
    enabled: !!currentUserId,
  });
};

export const useGetGroup = (groupId: string) => {
  useGroupsRealtimeSubscription();

  return useQuery({
    queryKey: ["groups", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select(`
          *,
          group_members!group_members_group_id_fkey (
            user_id,
            joined_at,
            profiles!group_members_user_id_fkey (
              id,
              first_name,
              last_name,
              avatar_url,
              email,
              phone
            )
          )
        `)
        .eq("id", groupId)
        .eq("group_members.is_active", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!groupId,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  return useMutation({
    mutationFn: async (newGroup: { name: string; description?: string; member_ids?: string[] }) => {
      if (!currentUserId) throw new Error("User not authenticated");

      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: newGroup.name,
          description: newGroup.description || "",
          created_by: currentUserId,
          is_active: true,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const uniqueMemberIds = [...new Set([currentUserId, ...(newGroup.member_ids || [])])];
      const memberInserts = uniqueMemberIds.map((userId) => ({
        group_id: group.id,
        user_id: userId,
        joined_by: currentUserId,
        is_active: true,
      }));

      const { error: membersError } = await supabase.from("group_members").insert(memberInserts);
      if (membersError) throw membersError;

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useUpdateGroup = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: GroupUpdate) => {
      const { data, error } = await supabase.from("groups").update(updates).eq("id", groupId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
    },
  });
};

export const useAddGroupMember = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const { data, error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: userId,
          joined_by: currentUserId || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
    },
  });
};

export const useListGroupMessages = (groupId: string) => {
  useGroupsRealtimeSubscription();

  return useQuery({
    queryKey: ["groupMessages", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_messages")
        .select(`
          *,
          profiles!group_messages_from_user_fkey (
            id,
            first_name,
            last_name,
            avatar_url,
            email,
            phone
          )
        `)
        .eq("group_id", groupId)
        .eq("is_active", true)
        .order("sent_at", { ascending: true });

      if (error) throw error;
      return hydrateChatAttachments(supabase.storage, data || []);
    },
    enabled: !!groupId,
  });
};

export const useCreateGroupMessage = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  return useMutation({
    mutationFn: async (newMessage: { group_id: string; body?: string; message_type?: string; attachments?: any }) => {
      if (!currentUserId) throw new Error("User not authenticated");

      const payload: GroupMessageInsert = {
        ...newMessage,
        from_user: currentUserId,
        sent_at: new Date().toISOString(),
        is_active: true,
        read_by: [currentUserId],
      };

      const { data, error } = await supabase.from("group_messages").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groupMessages", variables.group_id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase.from("groups").update({ is_active: false }).eq("id", groupId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};
