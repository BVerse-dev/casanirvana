import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";
import { useAuth } from "../contexts/AuthContext";

const SERVICE_SELECT = `
  id,
  name,
  icon_url,
  base_price,
  category,
  community_id,
  is_active
`;

const SERVICE_REQUEST_SELECT = `
  id,
  service_id,
  user_id,
  created_by,
  community_id,
  unit_id,
  status,
  title,
  description,
  request_details,
  preferred_date,
  preferred_time,
  total_amount,
  assigned_to,
  created_at,
  updated_at,
  services:service_id (
    id,
    name,
    icon_url,
    base_price,
    category
  )
`;

const toTimeString = (value) => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const hh = String(value.getHours()).padStart(2, "0");
    const mm = String(value.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}:00`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Already 24-hour format
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
    }

    // Handle "h:mm AM/PM" format from UI
    const parsed = new Date(`1970-01-01 ${trimmed}`);
    if (!Number.isNaN(parsed.getTime())) {
      const hh = String(parsed.getHours()).padStart(2, "0");
      const mm = String(parsed.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}:00`;
    }
  }

  return null;
};

export const useListCommunityServices = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["community-services", profile?.community_id],
    queryFn: async () => {
      if (!profile?.community_id) {
        return [];
      }

      const { data, error } = await supabase
        .from("services")
        .select(SERVICE_SELECT)
        .eq("community_id", profile.community_id)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.community_id,
  });
};

export const useListMyServiceRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["service-requests", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from("service_requests")
        .select(SERVICE_REQUEST_SELECT)
        .or(`user_id.eq.${user.id},created_by.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
};

export const useGetServiceRequest = (requestId) => {
  return useQuery({
    queryKey: ["service-request", requestId],
    queryFn: async () => {
      if (!requestId) return null;

      const { data, error } = await supabase
        .from("service_requests")
        .select(SERVICE_REQUEST_SELECT)
        .eq("id", requestId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
  });
};

export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      serviceId,
      title,
      description,
      preferredDate,
      preferredTime,
      totalAmount = 0,
    }) => {
      if (!user?.id) {
        throw new Error("Authentication required.");
      }
      if (!profile?.community_id || !profile?.unit_id) {
        throw new Error("Community and unit assignment are required.");
      }
      if (!serviceId) {
        throw new Error("Service selection is required.");
      }
      if (!description?.trim()) {
        throw new Error("Please provide service request details.");
      }

      const insertPayload = {
        service_id: serviceId,
        user_id: user.id,
        created_by: user.id,
        community_id: profile.community_id,
        unit_id: profile.unit_id,
        title: title || null,
        description: description.trim(),
        request_details: description.trim(),
        preferred_date: preferredDate || null,
        preferred_time: toTimeString(preferredTime),
        total_amount: Number(totalAmount || 0),
        status: "pending",
      };

      const { data, error } = await supabase
        .from("service_requests")
        .insert(insertPayload)
        .select(SERVICE_REQUEST_SELECT)
        .single();

      if (error) throw error;
      if (!data?.id) {
        throw new Error("Service request could not be confirmed. Please try again.");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["service-request"] });
    },
  });
};
