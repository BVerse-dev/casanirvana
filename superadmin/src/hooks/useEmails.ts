import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";
import { toast } from "react-toastify";

type Email = Database["public"]["Tables"]["emails"]["Row"];
type EmailInsert = Database["public"]["Tables"]["emails"]["Insert"];
type EmailUpdate = Database["public"]["Tables"]["emails"]["Update"];

// Email category counts hook
export const useEmailCategoryCounts = () => {
  return useQuery({
    queryKey: ["email-category-counts"],
    queryFn: async () => {
      const { data: emails, error } = await supabase
        .from("emails")
        .select("folder, is_starred, is_important, is_draft, is_deleted");

      if (error) throw error;

      const counts = {
        inbox: emails.filter(e => e.folder === "inbox").length,
        starred: emails.filter(e => e.is_starred).length,
        important: emails.filter(e => e.is_important).length,
        draft: emails.filter(e => e.is_draft).length,
        sent: emails.filter(e => e.folder === "sent").length,
        deleted: emails.filter(e => e.is_deleted).length,
      };

      return counts;
    },
  });
};

// List all emails
export const useListEmails = () => {
  return useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .order("sent_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Get single email
export const useGetEmail = (id: string) => {
  return useQuery({
    queryKey: ["emails", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });
};

// Get emails by folder (inbox, sent, drafts, etc.)
export const useListEmailsByFolder = (folder: string) => {
  return useQuery({
    queryKey: ["emails", "folder", folder],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("folder", folder)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Get starred emails
export const useListStarredEmails = () => {
  return useQuery({
    queryKey: ["emails", "starred"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("is_starred", true)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Get important emails
export const useListImportantEmails = () => {
  return useQuery({
    queryKey: ["emails", "important"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("is_important", true)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Create email
export const useCreateEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailData: EmailInsert) => {
      const { data, error } = await supabase
        .from("emails")
        .insert(emailData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-category-counts"] });
      toast.success("Email sent successfully!");
    },
    onError: (error) => {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    },
  });
};

// Update email (mark as read, star, etc.)
export const useUpdateEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EmailUpdate }) => {
      const { data, error } = await supabase
        .from("emails")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-category-counts"] });
      toast.success("Email updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating email:", error);
      toast.error("Failed to update email");
    },
  });
};

// Delete email
export const useDeleteEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("emails")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-category-counts"] });
      toast.success("Email deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting email:", error);
      toast.error("Failed to delete email");
    },
  });
};

// Mark email as read
export const useMarkEmailAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("emails")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-category-counts"] });
    },
  });
};

// Toggle email star
export const useToggleEmailStar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_starred }: { id: string; is_starred: boolean }) => {
      const { data, error } = await supabase
        .from("emails")
        .update({ is_starred })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-category-counts"] });
    },
  });
};
