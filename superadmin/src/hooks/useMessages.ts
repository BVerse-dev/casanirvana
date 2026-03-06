"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

let messagesChannel: ReturnType<typeof supabase.channel> | null = null;
let messagesSubscriberCount = 0;

const useAdminFetch = () => {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error("Missing admin session. Please sign in again.");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || "Request failed");
    }
    return payload;
  };

  return { fetchAdmin };
};

const useMessagesRealtimeSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    messagesSubscriberCount += 1;

    if (!messagesChannel) {
      messagesChannel = supabase
        .channel("superadmin-messages")
        .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
          queryClient.invalidateQueries({ queryKey: ["messages"] });
          queryClient.invalidateQueries({ queryKey: ["messageStats"] });
        })
        .subscribe();
    }

    return () => {
      messagesSubscriberCount -= 1;

      if (messagesSubscriberCount <= 0 && messagesChannel) {
        supabase.removeChannel(messagesChannel);
        messagesChannel = null;
        messagesSubscriberCount = 0;
      }
    };
  }, [queryClient]);
};

export interface ChatMessage extends Message {}

export interface MessageStats {
  totalMessages: number;
  activeChats: number;
  unreadMessages: number;
  onlineUsers: number;
}

export const useListMessages = (fromUser?: string, toUser?: string) => {
  useMessagesRealtimeSubscription();

  return useQuery({
    queryKey: ["messages", fromUser || "none", toUser || "none"],
    queryFn: async () => {
      if (!fromUser || !toUser) {
        return [];
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .is("deleted_at", null)
        .or(`and(from_user.eq.${fromUser},to_user.eq.${toUser}),and(from_user.eq.${toUser},to_user.eq.${fromUser})`)
        .order("sent_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!fromUser && !!toUser,
  });
};

export const useGetMessage = (id: string) => {
  useMessagesRealtimeSubscription();

  return useQuery({
    queryKey: ["messages", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (newMessage: MessageInsert) =>
      fetchAdmin("/admin/messages", {
        method: "POST",
        body: JSON.stringify(newMessage),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["messageStats"] });
    },
  });
};

export const useUpdateMessage = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (updates: MessageUpdate) =>
      fetchAdmin(`/admin/messages/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
      queryClient.invalidateQueries({ queryKey: ["messageStats"] });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/messages/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["messageStats"] });
    },
  });
};

export const useMessageStats = () => {
  useMessagesRealtimeSubscription();

  return useQuery({
    queryKey: ["messageStats"],
    queryFn: async (): Promise<MessageStats> => {
      const { count: totalMessages, error: totalMessagesError } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null);

      if (totalMessagesError) {
        throw totalMessagesError;
      }

      const { count: unreadMessages, error: unreadMessagesError } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .or("is_read.eq.false,read.eq.false");

      if (unreadMessagesError) {
        throw unreadMessagesError;
      }

      const { data: conversationRows, error: conversationsError } = await supabase
        .from("messages")
        .select("from_user, to_user")
        .is("deleted_at", null);

      if (conversationsError) {
        throw conversationsError;
      }

      const uniqueConversations = new Set<string>();
      for (const row of conversationRows || []) {
        if (!row.from_user || !row.to_user) continue;
        uniqueConversations.add([row.from_user, row.to_user].sort().join("-"));
      }

      const onlineThreshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: onlineUsers, error: onlineUsersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .gte("last_login", onlineThreshold);

      if (onlineUsersError) {
        throw onlineUsersError;
      }

      return {
        totalMessages: totalMessages || 0,
        activeChats: uniqueConversations.size,
        unreadMessages: unreadMessages || 0,
        onlineUsers: onlineUsers || 0,
      };
    },
  });
};
