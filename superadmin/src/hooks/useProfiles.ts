"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";
import { mapAvatarUrl } from "../utils/avatarMapper";
import { avatars } from "../assets/images/users";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

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

// Extended profile type for UI compatibility with existing UserType
export interface ChatUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  role: string;
  // Computed fields for UI compatibility
  name: string;
  avatar: any; // Changed to any to support imported image objects
  contact: string;
  location: string;
  languages: string[];
  activityStatus: "online" | "offline";
  message?: string;
  time: Date; // Made required to match UserType
  mutualCount: number; // Made required to match UserType
}

// Transform profile to ChatUser format
const transformProfileToChatUser = (profile: Profile): ChatUser => {
  // Use mapAvatarUrl to get proper imported image object
  const mappedAvatar = mapAvatarUrl(profile.avatar_url);
  
  return {
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    avatar_url: profile.avatar_url || undefined,
    phone: profile.phone || undefined,
    role: profile.role,
    // Computed fields
    name: `${profile.first_name} ${profile.last_name}`,
    avatar: mappedAvatar || avatars.avatar1, // Use mapped avatar or default to avatar1
    contact: profile.phone || "Not provided",
    location: "Casa Nirvana", // Default location
    languages: ["English"], // Default languages
    activityStatus: profile.id.charCodeAt(0) % 3 === 0 ? "online" : "offline", // Deterministic activity based on ID
    message: "Available for chat",
    time: new Date('2024-01-01'), // Fixed date to prevent hydration issues
    mutualCount: parseInt(profile.id.slice(-2), 16) || 50, // Deterministic count based on ID
  };
};

// List all users for chat - only those that exist in both users and profiles tables
export const useListChatUsers = () => {
  const { data: session } = useSession();
  const currentProfileId = session?.user?.id;

  return useQuery({
    queryKey: ["chatUsers", currentProfileId],
    queryFn: async () => {
      // First get all valid user IDs from the users table
      const { data: validUsers, error: usersError } = await supabase
        .from("users")
        .select("id");

      if (usersError) throw usersError;

      const validUserIds = new Set((validUsers || []).map((user) => user.id));

      // Then get profiles and keep those linked to a valid auth user
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) throw error;

      return (data || [])
        .filter((profile) => {
          const authId = profile.user_id || profile.id;
          if (!authId || !validUserIds.has(authId)) {
            return false;
          }
          if (currentProfileId && profile.id === currentProfileId) {
            return false;
          }
          return true;
        })
        .map(transformProfileToChatUser);
    },
  });
};

// Get single profile by profile ID for chat detail view
export const useGetChatUser = (id: string) => {
  return useQuery({
    queryKey: ["chatUser", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return transformProfileToChatUser(data);
    },
    enabled: !!id,
  });
};

// List all profiles (basic hook)
export const useListProfiles = () => {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

// Get single profile
export const useGetProfile = (id: string) => {
  return useQuery({
    queryKey: ["profiles", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

// Create profile
export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (newProfile: ProfileInsert) => {
      return fetchAdmin('/admin/profiles', {
        method: 'POST',
        body: JSON.stringify(newProfile),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
    },
  });
};

// Update profile
export const useUpdateProfile = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      return fetchAdmin(`/admin/profiles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
      queryClient.invalidateQueries({ queryKey: ["profiles", id] });
      queryClient.invalidateQueries({ queryKey: ["chatUser", id] });
    },
  });
};

// Delete profile
export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/profiles/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
    },
  });
};
