import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { UserType } from "@/types/auth";
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from "@/lib/supabaseAdmin";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET");
}

const ADMIN_ROLES = ["admin", "superadmin", "agency_manager", "facility_manager"] as const;
type AdminRole = (typeof ADMIN_ROLES)[number];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: string | null | undefined): value is string =>
  typeof value === "string" && UUID_PATTERN.test(value);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const createAuthRefreshClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
};

const getJwtExpiryMs = (jwt: string): number | null => {
  try {
    const [, payload] = jwt.split(".");
    if (!payload) return null;

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
    };

    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

const refreshSupabaseAccessToken = async (refreshToken: string) => {
  const refreshClient = createAuthRefreshClient();
  const { data, error } = await refreshClient.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    throw new Error(error?.message || "Failed to refresh Supabase session");
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token || refreshToken,
  };
};

type ScopeClaims = {
  agencyId: string | null;
  communityId: string | null;
  scopedAgencyIds: string[];
  scopedCommunityIds: string[];
};

function dedupeUuid(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter(isUuid))];
}

async function resolveScopeClaims(profile: {
  id: string;
  role: string;
  community_id: string | null;
  email: string | null;
}): Promise<ScopeClaims> {
  const role = profile.role as AdminRole;

  if (role === "superadmin") {
    return {
      agencyId: null,
      communityId: isUuid(profile.community_id) ? profile.community_id : null,
      scopedAgencyIds: [],
      scopedCommunityIds: [],
    };
  }

  const scopedCommunitySet = new Set<string>();

  if (isUuid(profile.community_id)) {
    scopedCommunitySet.add(profile.community_id);
  }

  const { data: communityAdminRows, error: communityAdminsError } = await supabaseAdmin
    .from("community_admins")
    .select("community_id")
    .eq("user_id", profile.id);

  if (communityAdminsError) {
    console.warn("Unable to load community_admins scope:", communityAdminsError.message);
  } else {
    (communityAdminRows || []).forEach((row) => {
      if (isUuid(row.community_id)) {
        scopedCommunitySet.add(row.community_id);
      }
    });
  }

  const { data: legacyCommunityRows, error: legacyCommunityError } = await supabaseAdmin
    .from("communities")
    .select("id")
    .contains("admins", [profile.id]);

  if (legacyCommunityError) {
    console.warn("Unable to load legacy community admin scope:", legacyCommunityError.message);
  } else {
    (legacyCommunityRows || []).forEach((row) => {
      if (isUuid(row.id)) {
        scopedCommunitySet.add(row.id);
      }
    });
  }

  const scopedCommunityIds = dedupeUuid([...scopedCommunitySet]);
  let scopedAgencyIds: string[] = [];

  if (scopedCommunityIds.length > 0) {
    const { data: communityRows, error: communityRowsError } = await supabaseAdmin
      .from("communities")
      .select("id, agency_id")
      .in("id", scopedCommunityIds);

    if (communityRowsError) {
      console.warn("Unable to resolve agency scope from communities:", communityRowsError.message);
    } else {
      scopedAgencyIds = dedupeUuid((communityRows || []).map((community) => community.agency_id));
    }
  }

  if (scopedAgencyIds.length === 0 && profile.email) {
    const { data: staffRows, error: staffError } = await supabaseAdmin
      .from("agency_staff")
      .select("agency_id")
      .eq("email", profile.email)
      .eq("is_active", true);

    if (staffError) {
      console.warn("Unable to resolve agency scope from agency_staff:", staffError.message);
    } else {
      scopedAgencyIds = dedupeUuid((staffRows || []).map((staff) => staff.agency_id));
    }
  }

  return {
    agencyId: scopedAgencyIds[0] || null,
    communityId: isUuid(profile.community_id) ? profile.community_id : scopedCommunityIds[0] || null,
    scopedAgencyIds,
    scopedCommunityIds,
  };
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email:",
          type: "text",
          placeholder: "Enter your username",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Authenticate via Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (authError || !authData.user) {
            throw new Error(authError?.message || "Invalid credentials");
          }

          // Fetch profile with admin privileges (server-side only)
          const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .single();

          if (profileError || !profile) {
            throw new Error("User profile not found");
          }

          if (!ADMIN_ROLES.includes(profile.role as AdminRole)) {
            throw new Error("Access denied. Admin privileges required.");
          }

          const scopeClaims = await resolveScopeClaims({
            id: profile.id,
            role: profile.role,
            community_id: profile.community_id,
            email: profile.email,
          });

          if (
            profile.role !== "superadmin" &&
            scopeClaims.scopedCommunityIds.length === 0 &&
            scopeClaims.scopedAgencyIds.length === 0
          ) {
            throw new Error("No tenant scope is assigned to this admin account. Contact superadmin.");
          }

          return {
            id: profile.id,
            email: profile.email!,
            username: `${profile.first_name}_${profile.last_name}`.toLowerCase(),
            password: "",
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            role: profile.role,
            token: authData.session?.access_token || "",
            refreshToken: authData.session?.refresh_token || "",
            agencyId: scopeClaims.agencyId,
            communityId: scopeClaims.communityId,
            scopedAgencyIds: scopeClaims.scopedAgencyIds,
            scopedCommunityIds: scopeClaims.scopedCommunityIds,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error(error instanceof Error ? error.message : "Authentication failed");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/sign-in",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    session: ({ session, token }) => {
      session.user = {
        ...session.user,
        email: (token.email as string | undefined) ?? session.user?.email,
        name: (token.name as string | undefined) ?? session.user?.name,
        id: (token.userId as string | undefined) ?? session.user?.id,
        agencyId:
          (token.agencyId as string | null | undefined) ??
          session.user?.agencyId ??
          null,
        communityId:
          (token.communityId as string | null | undefined) ??
          session.user?.communityId ??
          null,
        scopedAgencyIds:
          (token.scopedAgencyIds as string[] | undefined) ?? session.user?.scopedAgencyIds ?? [],
        scopedCommunityIds:
          (token.scopedCommunityIds as string[] | undefined) ??
          session.user?.scopedCommunityIds ??
          [],
      };
      if (token.role) {
        session.user.role = token.role as string;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token.refreshToken) {
        session.refreshToken = token.refreshToken as string;
      }
      return Promise.resolve(session);
    },
    jwt: async ({ token, user }) => {
      // Store user data in JWT token
      if (user) {
        const customUser = user as UserType;
        const fullName = [customUser.firstName, customUser.lastName].filter(Boolean).join(" ").trim();
        token.email = customUser.email;
        token.name = fullName || customUser.email || token.name;
        token.role = customUser.role;
        token.userId = customUser.id;
        token.accessToken = customUser.token;
        token.refreshToken = (customUser as any).refreshToken;
        token.agencyId = customUser.agencyId;
        token.communityId = customUser.communityId;
        token.scopedAgencyIds = customUser.scopedAgencyIds || [];
        token.scopedCommunityIds = customUser.scopedCommunityIds || [];
      }

      const accessToken = token.accessToken as string | undefined;
      const refreshToken = token.refreshToken as string | undefined;

      if (accessToken && refreshToken) {
        const expiresAt = getJwtExpiryMs(accessToken);
        const shouldRefresh = !expiresAt || Date.now() >= expiresAt - 60_000;

        if (shouldRefresh) {
          try {
            const refreshed = await refreshSupabaseAccessToken(refreshToken);
            token.accessToken = refreshed.accessToken;
            token.refreshToken = refreshed.refreshToken;
          } catch (error) {
            console.error("Supabase token refresh failed:", error);
          }
        }
      }

      return Promise.resolve(token);
    },
  },
  session: {
    maxAge: 24 * 60 * 60,
    generateSessionToken: () => {
      return randomBytes(32).toString("hex");
    },
  },
};
