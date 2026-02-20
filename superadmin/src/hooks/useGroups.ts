"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";

type Group = Database["public"]["Tables"]["groups"]["Row"];
type GroupInsert = Database["public"]["Tables"]["groups"]["Insert"];
type GroupUpdate = Database["public"]["Tables"]["groups"]["Update"];

type GroupMember = Database["public"]["Tables"]["group_members"]["Row"];
type GroupMemberInsert = Database["public"]["Tables"]["group_members"]["Insert"];

type GroupMessage = Database["public"]["Tables"]["group_messages"]["Row"];
type GroupMessageInsert = Database["public"]["Tables"]["group_messages"]["Insert"];

// Extended group type for UI compatibility (like dummy data structure)
export interface ChatGroup extends Group {
  member_count?: number;
  last_message?: string;
  last_message_time?: string;
  last_message_sender?: string;
  unread_count?: number;
  is_member?: boolean;
  // For UI compatibility with existing dummy data
  groupName?: string;
  variant?: string;
  time?: Date;
  change?: number;
}

// Get current user ID (using a demo user for now)
const getCurrentUserId = () => {
  // For demo purposes, using Alice Johnson from profiles
  // In a real app, this would come from your authentication context
  return "35995267-1de3-48e7-a991-91f38ffdcab1"; // Alice Johnson
};

// List all groups for current user
export const useListGroups = () => {
  const userId = getCurrentUserId();

  return useQuery({
    queryKey: ["groups", userId],
    queryFn: async (): Promise<ChatGroup[]> => {
      if (!userId) return [];

      // First get groups where user is a member
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
            is_active
          )
        `)
        .eq("user_id", userId)
        .eq("is_active", true);

      if (memberError) throw memberError;

      // Transform to ChatGroup format for UI compatibility
      const groups: ChatGroup[] = await Promise.all(
        (memberGroups || []).map(async (member: any) => {
          const group = member.groups;
          if (!group) return null;

          // Get member count
          const { count: memberCount } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id)
            .eq("is_active", true);

          // Get last message with sender profile
          const { data: lastMessage } = await supabase
            .from("group_messages")
            .select(`
              body, 
              sent_at,
              from_user,
              profiles (
                first_name,
                last_name
              )
            `)
            .eq("group_id", group.id)
            .order("sent_at", { ascending: false })
            .limit(1)
            .single();

          // Process last message with sender name
          const currentUserId = getCurrentUserId();
          let lastMessageText = "No messages yet";
          let lastMessageSender = "";
          
          if (lastMessage) {
            const hasValidProfile = lastMessage.profiles && 
              typeof lastMessage.profiles === 'object' && 
              !('message' in lastMessage.profiles);
            
            const senderName = hasValidProfile
              ? (lastMessage.profiles as any).first_name || 'Unknown'
              : 'Unknown';
            
            // Show "You" if current user sent the message
            lastMessageSender = lastMessage.from_user === currentUserId ? "You" : senderName;
            lastMessageText = lastMessage.body || "";
          }

          // Convert to UI format
          return {
            ...group,
            member_count: memberCount || 0,
            last_message: lastMessageText,
            last_message_time: lastMessage?.sent_at || group.created_at,
            last_message_sender: lastMessageSender,
            unread_count: 0, // TODO: implement unread count
            is_member: true,
            // UI compatibility fields
            groupName: group.name,
            variant: "primary", // Default variant
            time: new Date(group.created_at || Date.now()),
            change: 0, // Default change count
          };
        })
      );

      return groups.filter(Boolean) as ChatGroup[];
    },
    enabled: !!userId,
  });
};

// Get single group details
export const useGetGroup = (groupId: string) => {
  return useQuery({
    queryKey: ["groups", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select(`
          *,
          group_members!group_members_group_id_fkey (
            user_id,
            profiles!group_members_user_id_fkey (
              id,
              first_name,
              last_name,
              avatar_url
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

// Create new group
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newGroup: { 
      name: string; 
      description?: string; 
      member_ids?: string[];
    }) => {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) throw new Error("User not authenticated");

      // Create the group
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

      // Add creator as member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: currentUserId,
          is_active: true,
        });

      if (memberError) throw memberError;

      // Add other members if provided
      if (newGroup.member_ids && newGroup.member_ids.length > 0) {
        const memberInserts = newGroup.member_ids.map(userId => ({
          group_id: group.id,
          user_id: userId,
          is_active: true,
        }));

        const { error: membersError } = await supabase
          .from("group_members")
          .insert(memberInserts);

        if (membersError) throw membersError;
      }

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

// Update group
export const useUpdateGroup = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: GroupUpdate) => {
      const { data, error } = await supabase
        .from("groups")
        .update(updates)
        .eq("id", groupId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
    },
  });
};

// Add member to group
export const useAddGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userId }: {
      groupId: string;
      userId: string;
    }) => {
      const { data, error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: userId,
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

// List group messages
export const useListGroupMessages = (groupId: string) => {
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
            avatar_url
          )
        `)
        .eq("group_id", groupId)
        .eq("is_active", true)
        .order("sent_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!groupId,
  });
};

// Send group message
export const useCreateGroupMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMessage: {
      group_id: string;
      body?: string;
      message_type?: string;
      attachments?: any;
    }) => {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("group_messages")
        .insert({
          ...newMessage,
          from_user: currentUserId,
          sent_at: new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groupMessages", variables.group_id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

// Delete group
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from("groups")
        .update({ is_active: false })
        .eq("id", groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}; 