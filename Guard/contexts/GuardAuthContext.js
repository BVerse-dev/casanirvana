import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../utils/supabase";

const GuardAuthContext = createContext(undefined);
const GUARD_ROLE_VALUES = ["guard", "GUARD"];

const resolveGuardAccessErrorMessage = ({ hasUser, hasGuard, guardIsActive, hasCommunityScope }) => {
  if (!hasUser) {
    return "Access denied: Guard account record could not be found.";
  }
  if (!hasGuard) {
    return "Access denied: Your guard profile has not been provisioned yet. Contact your administrator.";
  }
  if (!guardIsActive) {
    return "Access denied: Your guard profile is inactive. Contact your administrator.";
  }
  if (!hasCommunityScope) {
    return "Access denied: Your guard account is awaiting community assignment.";
  }
  return null;
};

const loadGuardBundle = async (authUserId) => {
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select(
      "id, email, first_name, last_name, phone, role, community_id, unit_id, created_at"
    )
    .eq("id", authUserId)
    .in("role", GUARD_ROLE_VALUES)
    .maybeSingle();

  if (userError) {
    throw userError;
  }
  if (!userData) {
    return null;
  }

  const { data: guardData, error: guardError } = await supabase
    .from("guards")
    .select(
      "id, user_id, full_name, first_name, last_name, display_name, employee_id, email, phone, mobile, status, is_active, community_id, gate_assignment, avatar_url, shift_type, last_login"
    )
    .eq("user_id", authUserId)
    .maybeSingle();

  if (guardError) {
    throw guardError;
  }
  if (!guardData) {
    return { user: userData, guard: null, community: null };
  }

  const resolvedCommunityId = guardData.community_id || userData.community_id;
  if (!resolvedCommunityId) {
    return { user: userData, guard: guardData, community: null };
  }

  const { data: communityData, error: communityError } = await supabase
    .from("communities")
    .select("id, name, agency_id")
    .eq("id", resolvedCommunityId)
    .maybeSingle();

  if (communityError) {
    throw communityError;
  }

  return {
    user: userData,
    guard: guardData,
    community: communityData ?? null,
  };
};

export const GuardAuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [user, setUser] = useState(null);
  const [guard, setGuard] = useState(null);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);

  const clearAuthState = useCallback(() => {
    setSession(null);
    setAuthUser(null);
    setUser(null);
    setGuard(null);
    setCommunity(null);
  }, []);

  const hydrateFromSession = useCallback(
    async (nextSession, { enforceGuard = true } = {}) => {
      if (!nextSession?.user) {
        clearAuthState();
        setAuthError(null);
        return null;
      }

      setSession(nextSession);
      setAuthUser(nextSession.user);
      const bundle = await loadGuardBundle(nextSession.user.id);
      const guardStatus = String(bundle?.guard?.status || "active").toLowerCase();
      const guardIsActive = bundle?.guard?.is_active !== false && guardStatus === "active";
      const hasCommunityScope = Boolean(
        bundle?.guard?.community_id || bundle?.user?.community_id
      );

      const accessErrorMessage = resolveGuardAccessErrorMessage({
        hasUser: Boolean(bundle?.user),
        hasGuard: Boolean(bundle?.guard),
        guardIsActive,
        hasCommunityScope,
      });

      if (accessErrorMessage) {
        if (enforceGuard) {
          await supabase.auth.signOut();
          clearAuthState();
        } else {
          setUser(bundle?.user ?? null);
          setGuard(null);
          setCommunity(null);
        }
        setAuthError(accessErrorMessage);
        return { accessDenied: true, message: accessErrorMessage };
      }

      setUser(bundle.user);
      setGuard(bundle.guard);
      setCommunity(bundle.community);
      setAuthError(null);
      return bundle;
    },
    [clearAuthState]
  );

  const initializeAuth = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      await hydrateFromSession(currentSession);
    } catch (error) {
      clearAuthState();
      setAuthError(error?.message || "Failed to initialize guard session.");
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [clearAuthState, hydrateFromSession]);

  useEffect(() => {
    let mounted = true;
    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setLoading(true);
      try {
        await hydrateFromSession(nextSession);
      } catch (error) {
        clearAuthState();
        setAuthError(error?.message || "Guard authentication update failed.");
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [clearAuthState, hydrateFromSession, initializeAuth]);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        throw error;
      }

      const bundle = await hydrateFromSession(data.session);
      if (!bundle || bundle?.accessDenied) {
        throw new Error(bundle?.message || "Access denied: Guard credentials required.");
      }

      if (bundle.guard?.id) {
        await supabase
          .from("guards")
          .update({ last_login: new Date().toISOString() })
          .eq("id", bundle.guard.id);
      }

      return bundle;
    } catch (error) {
      setAuthError(error?.message || "Sign in failed.");
      throw new Error(error?.message || "Sign in failed.");
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [hydrateFromSession]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      clearAuthState();
      setAuthError(null);
    } catch (error) {
      setAuthError(error?.message || "Sign out failed.");
      throw error;
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [clearAuthState]);

  const refreshGuardProfile = useCallback(async () => {
    if (!session?.user?.id) return null;
    setLoading(true);
    try {
      return await hydrateFromSession(session);
    } finally {
      setLoading(false);
    }
  }, [hydrateFromSession, session]);

  const value = useMemo(
    () => ({
      authUser,
      session,
      user,
      profile: user,
      guard,
      community,
      authError,
      loading,
      initialized,
      isAuthenticated: Boolean(session && user && guard),
      isGuard: Boolean(user && guard),
      signIn,
      signOut,
      refreshGuardProfile,
      initializeAuth,
    }),
    [
      authError,
      authUser,
      community,
      guard,
      initialized,
      loading,
      session,
      signIn,
      signOut,
      refreshGuardProfile,
      initializeAuth,
      user,
    ]
  );

  return (
    <GuardAuthContext.Provider value={value}>{children}</GuardAuthContext.Provider>
  );
};

export const useGuardAuth = () => {
  const context = useContext(GuardAuthContext);
  if (!context) {
    throw new Error("useGuardAuth must be used within a GuardAuthProvider");
  }
  return context;
};
