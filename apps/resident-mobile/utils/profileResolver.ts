import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './supabase';

const isNotFoundError = (error: PostgrestError | null) => error?.code === 'PGRST116';

export const getProfileByAuthId = async <T = any>(
  authUserId: string | null | undefined,
  selectColumns = 'id'
): Promise<T | null> => {
  if (!authUserId) {
    return null;
  }

  const byUserId = await supabase
    .from('profiles')
    .select(selectColumns)
    .eq('user_id', authUserId)
    .maybeSingle();

  if (byUserId.error && !isNotFoundError(byUserId.error)) {
    throw byUserId.error;
  }

  if (byUserId.data) {
    return byUserId.data as T;
  }

  const byId = await supabase
    .from('profiles')
    .select(selectColumns)
    .eq('id', authUserId)
    .maybeSingle();

  if (byId.error && !isNotFoundError(byId.error)) {
    throw byId.error;
  }

  return (byId.data as T) || null;
};

export const resolveProfileIdByAuthId = async (
  authUserId: string | null | undefined
): Promise<string | null> => {
  const profile = await getProfileByAuthId<{ id: string }>(authUserId, 'id');
  return profile?.id || null;
};

export const getCurrentProfile = async <T = any>(
  selectColumns = 'id'
): Promise<T | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return getProfileByAuthId<T>(user.id, selectColumns);
};

export const resolveCurrentProfileId = async (): Promise<string | null> => {
  const profile = await getCurrentProfile<{ id: string }>('id');
  return profile?.id || null;
};
