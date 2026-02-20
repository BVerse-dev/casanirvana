"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const useAdminFetch = () => {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Missing admin session. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || 'Request failed');
    }
    return payload;
  };

  return { fetchAdmin };
};

// Extended message types for UI compatibility
export interface ChatMessage extends Message {
  // Profile data is now fetched separately via useListChatUsers/useGetChatUser
  // and mapped in the component level
}

export interface MessageStats {
  totalMessages: number;
  activeChats: number;
  unreadMessages: number;
  onlineUsers: number;
}

// List messages between users
export const useListMessages = (fromUser?: string, toUser?: string) => {
  return useQuery({
    queryKey: ["messages", fromUser, toUser],
    queryFn: async () => {
      let query = supabase
        .from("messages")
        .select("*")
        .order("sent_at", { ascending: true });

      if (fromUser && toUser) {
        query = query.or(
          `and(from_user.eq.${fromUser},to_user.eq.${toUser}),and(from_user.eq.${toUser},to_user.eq.${fromUser})`,
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

// Get single message
export const useGetMessage = (id: string) => {
  return useQuery({
    queryKey: ["messages", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

// Create message
export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (newMessage: MessageInsert) => {
      return fetchAdmin('/admin/messages', {
        method: 'POST',
        body: JSON.stringify(newMessage),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

// Update message (mark as read)
export const useUpdateMessage = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (updates: MessageUpdate) => {
      return fetchAdmin(`/admin/messages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
    },
  });
};

// Delete message
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/messages/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

// Get message statistics for dashboard
export const useMessageStats = () => {
  return useQuery({
    queryKey: ["messageStats"],
    queryFn: async () => {
      // Get total messages
      const { count: totalMessages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });

      // Get unread messages count
      const { count: unreadMessages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("read", false);

      // Get active chats (unique conversation pairs)
      const { data: conversations } = await supabase
        .from("messages")
        .select("from_user, to_user")
        .order("sent_at", { ascending: false });

      // Calculate unique conversations
      const uniqueConversations = new Set();
      conversations?.forEach((msg) => {
        const key = [msg.from_user, msg.to_user].sort().join("-");
        uniqueConversations.add(key);
      });

      // Get online users (simplified - in real app would check last activity)
      const { count: onlineUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "user");

      const stats: MessageStats = {
        totalMessages: totalMessages || 0,
        activeChats: uniqueConversations.size,
        unreadMessages: unreadMessages || 0,
        onlineUsers: Math.floor((onlineUsers || 0) * 0.3), // Simulate ~30% online
      };

      return stats;
    },
  });
};

// Real-time subscriptions hook for messages
export const useMessagesRealtime = () => {
  const queryClient = useQueryClient();

  return {
    subscribeToMessages: () => {
      const channel = supabase
        .channel('messages_realtime')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'messages' 
          }, 
          () => {
            // Invalidate all message-related queries when messages change
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            queryClient.invalidateQueries({ queryKey: ['messageStats'] });
          }
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    },
  };
};
