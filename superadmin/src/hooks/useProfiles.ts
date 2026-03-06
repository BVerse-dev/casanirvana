"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";
import { avatars } from "../assets/images/users";
import { mapAvatarUrl } from "../utils/avatarMapper";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

type CommunityLite = Pick<Database["public"]["Tables"]["communities"]["Row"], "id" | "name">;
type UnitLite = Pick<Database["public"]["Tables"]["units"]["Row"], "id" | "block" | "number" | "unit_number">;
type MessageLite = Pick<Database["public"]["Tables"]["messages"]["Row"], "body" | "message_type" | "sent_at" | "from_user" | "to_user" | "is_read" | "read">;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

type ProfileWithRelations = Profile & {
  communities?: CommunityLite | null;
  units?: UnitLite | null;
};

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

const getActivityStatus = (profile: Profile) => {
  if (!profile.is_active || !profile.last_login) {
    return "offline" as const;
  }

  const lastLoginTime = new Date(profile.last_login).getTime();
  if (Number.isNaN(lastLoginTime)) {
    return "offline" as const;
  }

  return Date.now() - lastLoginTime <= ONLINE_THRESHOLD_MS ? ("online" as const) : ("offline" as const);
};

const buildLocationLabel = (profile: ProfileWithRelations) => {
  const communityName = profile.communities?.name || null;
  const unitNumber = profile.units?.number || profile.units?.unit_number || null;
  const block = profile.units?.block || profile.block_number || null;

  if (communityName && (block || unitNumber)) {
    const unitLabel = `${block || ""}${block && unitNumber ? "-" : ""}${unitNumber || ""}`.trim() || "Unit assigned";
    return `${unitLabel} | ${communityName}`;
  }

  if (communityName) {
    return communityName;
  }

  return "No community assigned";
};

const buildLastMessageMeta = (messages: MessageLite[], currentProfileId: string, contactProfileId: string) => {
  const contactMessages = messages.filter((message) => {
    const fromUser = message.from_user;
    const toUser = message.to_user;
    return (
      (fromUser === currentProfileId && toUser === contactProfileId) ||
      (fromUser === contactProfileId && toUser === currentProfileId)
    );
  });

  if (!contactMessages.length) {
    return {
      message: "No messages yet",
      time: new Date(0),
      unreadCount: 0,
      chatIcon: undefined,
    };
  }

  const sortedMessages = [...contactMessages].sort((left, right) => {
    const leftTime = new Date(left.sent_at || 0).getTime();
    const rightTime = new Date(right.sent_at || 0).getTime();
    return rightTime - leftTime;
  });

  const latest = sortedMessages[0];
  const unreadCount = sortedMessages.filter(
    (message) => message.from_user === contactProfileId && (message.is_read === false || message.read === false),
  ).length;

  const latestLabel =
    latest.message_type === "file"
      ? `Shared a file${latest.body ? `: ${latest.body}` : ""}`
      : latest.message_type === "video_call"
        ? "Started a call"
        : latest.body || "Message sent";

  return {
    message: latestLabel,
    time: new Date(latest.sent_at || Date.now()),
    unreadCount,
    chatIcon: latest.message_type === "file" ? "ri:attachment-2" : latest.message_type === "video_call" ? "ri:video-on-line" : undefined,
  };
};

const transformProfileToChatUser = (profile: ProfileWithRelations, meta: ReturnType<typeof buildLastMessageMeta>): ChatUser => {
  const mappedAvatar = mapAvatarUrl(profile.avatar_url);
  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();

  return {
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    avatar_url: profile.avatar_url || undefined,
    phone: profile.phone || undefined,
    role: profile.role,
    name: fullName || profile.email,
    avatar: mappedAvatar || avatars.avatar1,
    contact: profile.phone || "Not provided",
    location: buildLocationLabel(profile),
    languages: ["English"],
    activityStatus: getActivityStatus(profile),
    message: meta.message,
    time: meta.time,
    mutualCount: 0,
    chatIcon: meta.chatIcon,
    unreadCount: meta.unreadCount,
  };
};

const CHAT_USER_SELECT = `
  *,
  communities:community_id (
    id,
    name
  ),
  units:unit_id (
    id,
    block,
    number,
    unit_number
  )
`;

export const useListChatUsers = () => {
  const { data: session } = useSession();
  const currentProfileId = session?.user?.id;

  return useQuery({
    queryKey: ["chatUsers", currentProfileId || "anonymous"],
    queryFn: async () => {
      if (!currentProfileId) {
        return [];
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(CHAT_USER_SELECT)
        .order("first_name", { ascending: true });

      if (profilesError) throw profilesError;

      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("body, message_type, sent_at, from_user, to_user, is_read, read")
        .is("deleted_at", null)
        .or(`from_user.eq.${currentProfileId},to_user.eq.${currentProfileId}`)
        .order("sent_at", { ascending: false });

      if (messagesError) throw messagesError;

      const profiles = (profilesData || []) as ProfileWithRelations[];

      return profiles
        .filter((profile) => profile.id !== currentProfileId && profile.user_id !== currentProfileId)
        .map((profile) => transformProfileToChatUser(profile, buildLastMessageMeta((messagesData || []) as MessageLite[], currentProfileId, profile.id)))
        .sort((left, right) => right.time.getTime() - left.time.getTime() || left.name.localeCompare(right.name));
    },
    enabled: !!currentProfileId,
  });
};

export const useGetChatUser = (id: string) => {
  const { data: session } = useSession();
  const currentProfileId = session?.user?.id;

  return useQuery({
    queryKey: ["chatUser", id, currentProfileId || "anonymous"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select(CHAT_USER_SELECT).eq("id", id).single();
      if (error) throw error;

      let meta = {
        message: "No messages yet",
        time: new Date(0),
        unreadCount: 0,
        chatIcon: undefined as string | undefined,
      };

      if (currentProfileId) {
        const { data: messagesData } = await supabase
          .from("messages")
          .select("body, message_type, sent_at, from_user, to_user, is_read, read")
          .is("deleted_at", null)
          .or(`and(from_user.eq.${currentProfileId},to_user.eq.${id}),and(from_user.eq.${id},to_user.eq.${currentProfileId})`)
          .order("sent_at", { ascending: false });

        meta = buildLastMessageMeta((messagesData || []) as MessageLite[], currentProfileId, id);
      }

      return transformProfileToChatUser(data as ProfileWithRelations, meta);
    },
    enabled: !!id,
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
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (newProfile: ProfileInsert) =>
      fetchAdmin("/admin/profiles", {
        method: "POST",
        body: JSON.stringify(newProfile),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
    },
  });
};

export const useUpdateProfile = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (updates: ProfileUpdate) =>
      fetchAdmin(`/admin/profiles/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
      queryClient.invalidateQueries({ queryKey: ["profiles", id] });
      queryClient.invalidateQueries({ queryKey: ["chatUser", id] });
    },
  });
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/profiles/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
    },
  });
};
