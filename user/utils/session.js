import { supabase } from './supabase';

// Function to refresh token if expired
export const refreshToken = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    console.error('Error refreshing token:', error.message);
    return null;
  }
  return data.session;
};

// Function to check token expiry and refresh if needed
export const checkAndRefreshToken = async () => {
  const session = supabase.auth.session();
  if (!session) {
    console.warn('No active session found');
    return null;
  }

  const { expires_at } = session;
  const currentTime = Math.floor(Date.now() / 1000);

  if (expires_at && currentTime >= expires_at) {
    console.log('Token expired, refreshing...');
    return await refreshToken();
  }

  return session;
};
