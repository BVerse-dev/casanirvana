export type UserType = {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  token: string;
  refreshToken?: string;
  agencyId?: string | null;
  communityId?: string | null;
  scopedAgencyIds?: string[];
  scopedCommunityIds?: string[];
};
