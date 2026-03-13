"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { avatars } from "@/assets/images/users";
import { useAdminApi } from "@/hooks/useAdminApi";
import type { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { mapAvatarUrl } from "@/utils/avatarMapper";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

type ChatUserApiRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string | null;
  phone?: string | null;
  role: string;
  name: string;
  contact: string;
  location: string;
  languages: string[];
  activityStatus: "online" | "offline";
  message?: string;
  time: string;
  mutualCount: number;
  chatIcon?: string;
  unreadCount?: number;
};

export interface ChatUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  role: string;
  name: string;
  avatar: any;
  contact: string;
  location: string;
  languages: string[];
  activityStatus: "online" | "offline";
  message?: string;
  time: Date;
  mutualCount: number;
  chatIcon?: string;
  unreadCount?: number;
}

const chatUsersQueryKey = ["admin-message-contacts"] as const;
const chatUserQueryKey = (id?: string) => ["admin-message-contact", id || ""] as const;

const mapChatUserRecord = (record: ChatUserApiRecord): ChatUser => ({
  ...record,
  avatar_url: record.avatar_url || undefined,
  phone: record.phone || undefined,
  avatar: mapAvatarUrl(record.avatar_url) || avatars.avatar1,
  time: new Date(record.time || 0),
});

export const useListChatUsers = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: chatUsersQueryKey,
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: ChatUserApiRecord[] }>("/admin/messages/contacts");
      return (payload.data || []).map(mapChatUserRecord);
    },
  });
};

export const useGetChatUser = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: chatUserQueryKey(id),
    enabled: hasToken && Boolean(id),
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: ChatUserApiRecord | null }>(`/admin/messages/contacts/${id}`);
      return payload.data ? mapChatUserRecord(payload.data) : null;
    },
  });
};

export const useListProfiles = () => {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("first_name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useGetProfile = (id: string) => {
  return useQuery({
    queryKey: ["profiles", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (newProfile: ProfileInsert) =>
      fetchAdmin("/admin/profiles", {
        method: "POST",
        body: JSON.stringify(newProfile),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: chatUsersQueryKey });
    },
  });
};

export const useUpdateProfile = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (updates: ProfileUpdate) =>
      fetchAdmin(`/admin/profiles/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: chatUsersQueryKey });
      queryClient.invalidateQueries({ queryKey: ["profiles", id] });
      queryClient.invalidateQueries({ queryKey: chatUserQueryKey(id) });
    },
  });
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/profiles/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: chatUsersQueryKey });
    },
  });
};
