import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: DefaultSession["user"] & {
      id?: string;
      role?: string;
      agencyId?: string | null;
      communityId?: string | null;
      scopedAgencyIds?: string[];
      scopedCommunityIds?: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    agencyId?: string | null;
    communityId?: string | null;
    scopedAgencyIds?: string[];
    scopedCommunityIds?: string[];
  }
}
