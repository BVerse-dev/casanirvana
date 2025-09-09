import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Get all users (admin only)
export const getUsers = async (): Promise<{ data: Profile[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('last_name, first_name');
  
  return { data, error };
};

// Get users by role
export const getUsersByRole = async (role: 'user' | 'guard' | 'admin'): Promise<{ data: Profile[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('last_name, first_name');
  
  return { data, error };
};

// Get a specific user by ID
export const getUserById = async (id: string): Promise<{ data: Profile | null; error: any }> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Get current user profile
export const getCurrentUserProfile = async (): Promise<{ data: Profile | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user?.id)
    .single();
  
  return { data, error };
};

// Update user profile
export const updateProfile = async (updates: ProfileUpdate): Promise<{ data: Profile | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userData.user?.id)
    .select()
    .single();
  
  return { data, error };
};

// Update user role (admin only)
export const updateUserRole = async (userId: string, role: 'user' | 'guard' | 'admin'): Promise<{ data: Profile | null; error: any }> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};

// Upload profile picture
export const uploadProfilePicture = async (file: File): Promise<{ data: { path: string } | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userData.user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `profile-pics/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) return { data: null, error };
  
  // Update the profile with the new picture URL
  const { data: profile, error: profileError } = await updateProfile({
    profile_pic_url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`
  });
  
  if (profileError) return { data: null, error: profileError };
  
  return { data: { path: filePath }, error: null };
};

// Search users by name or email
export const searchUsers = async (query: string): Promise<{ data: Profile[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('last_name, first_name');
  
  return { data, error };
};