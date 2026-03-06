"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

export type Service = Database["public"]["Tables"]["services"]["Row"] & {
  communities?: { name?: string | null } | null;
  name?: string | null;
  service_name?: string | null;
  is_active?: boolean | null;
};

type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];

let servicesChannel: ReturnType<typeof supabase.channel> | null = null;
let servicesSubscriberCount = 0;

export const getServiceDisplayName = (service?: Partial<Service> | null) => {
  return service?.name || service?.service_name || "Unnamed Service";
};

export const getServiceStatus = (service?: Partial<Service> | null) => {
  if (!service) return "inactive";
  if (typeof service.is_active === "boolean") {
    return service.is_active ? "active" : "inactive";
  }

  const normalized = String(service.status || "").trim().toLowerCase();
  if (["active", "enabled", "published"].includes(normalized)) {
    return "active";
  }
  if (["inactive", "disabled", "draft", "archived"].includes(normalized)) {
    return "inactive";
  }

  return "active";
};

export const isServiceActive = (service?: Partial<Service> | null) => getServiceStatus(service) === "active";

const useServicesRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    servicesSubscriberCount += 1;

    if (!servicesChannel) {
      servicesChannel = supabase
        .channel("superadmin-services")
        .on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => {
          queryClient.invalidateQueries({ queryKey: ["services"] });
        })
        .subscribe();
    }

    return () => {
      servicesSubscriberCount -= 1;

      if (servicesSubscriberCount <= 0 && servicesChannel) {
        supabase.removeChannel(servicesChannel);
        servicesChannel = null;
        servicesSubscriberCount = 0;
      }
    };
  }, [queryClient]);
};

export const useListServices = (communityId?: string) => {
  useServicesRealtime();

  return useQuery({
    queryKey: ["services", communityId || "all"],
    queryFn: async (): Promise<Service[]> => {
      let query = supabase
        .from("services")
        .select(`
          *,
          communities:community_id(name)
        `)
        .order("created_at", { ascending: false });

      if (communityId) {
        query = query.eq("community_id", communityId);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return (data || []) as Service[];
    },
  });
};

export const useGetService = (id: string) => {
  useServicesRealtime();

  return useQuery({
    queryKey: ["services", id],
    queryFn: async (): Promise<Service | null> => {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          communities:community_id(name)
        `)
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return (data as Service) || null;
    },
    enabled: Boolean(id),
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newService: ServiceInsert) => {
      const { data, error } = await supabase.from("services").insert(newService).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

export const useUpdateService = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: ServiceUpdate) => {
      const { data, error } = await supabase.from("services").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", id] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
