import { supabase } from "./supabase";

const isNotFoundError = (error) => error?.code === "PGRST116";

export const getProfileByAuthId = async (authUserId, selectColumns = "id") => {
  if (!authUserId) {
    return null;
  }

  const byUserId = await supabase
    .from("profiles")
    .select(selectColumns)
    .eq("user_id", authUserId)
    .maybeSingle();

  if (byUserId.error && !isNotFoundError(byUserId.error)) {
    throw byUserId.error;
  }

  if (byUserId.data) {
    return byUserId.data;
  }

  const byId = await supabase
    .from("profiles")
    .select(selectColumns)
    .eq("id", authUserId)
    .maybeSingle();

  if (byId.error && !isNotFoundError(byId.error)) {
    throw byId.error;
  }

  return byId.data || null;
};

export const getCurrentProfile = async (selectColumns = "id") => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return getProfileByAuthId(user.id, selectColumns);
};
