import { supabase } from "../utils/supabase";
import { getProfileByAuthId } from "../utils/profileResolver";
import LocationService from "./locationService";

export const EMERGENCY_TYPES = {
  fire_alert: {
    alertType: "fire",
    title: "Fire Emergency",
    priority: "critical",
    adminMessage:
      "A fire emergency has been reported by a resident. Immediate response is required.",
    userMessage:
      "Follow fire safety protocols and evacuate if in immediate danger. Emergency responders have been alerted.",
  },
  stuck_lift: {
    alertType: "maintenance",
    title: "Elevator Emergency",
    priority: "high",
    adminMessage:
      "An elevator emergency has been reported with person(s) potentially trapped.",
    userMessage:
      "Stay calm and use the lift emergency button. Help has been alerted.",
  },
  animal_threat: {
    alertType: "security",
    title: "Animal Threat",
    priority: "high",
    adminMessage:
      "A dangerous animal threat has been reported on the premises.",
    userMessage:
      "Avoid the affected area and stay in a safe location. Help has been alerted.",
  },
  visitor_threat: {
    alertType: "security",
    title: "Security Threat",
    priority: "critical",
    adminMessage:
      "A visitor-related security threat has been reported. Security response is required.",
    userMessage:
      "Secure your location and avoid confrontation. Security has been alerted.",
  },
};

const PROFILE_FIELDS = "id, first_name, last_name, email, phone, role, community_id, unit_id, is_active, status, user_id";

const isActiveProfile = (profile) => {
  if (!profile) {
    return false;
  }
  if (profile.is_active === false) {
    return false;
  }
  return profile.status !== "inactive";
};

const getProfileByAuthUserId = async (authUserId) => {
  return getProfileByAuthId(authUserId, PROFILE_FIELDS);
};

const getCurrentProfile = async (providedProfile) => {
  if (providedProfile?.id) {
    return providedProfile;
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  const profile = await getProfileByAuthUserId(user?.id);
  if (!profile) {
    throw new Error("Authenticated profile not found");
  }

  return profile;
};

const listProfilesForCommunity = async (communityId, roles = null) => {
  if (!communityId) {
    return [];
  }

  let query = supabase
    .from("profiles")
    .select("id, user_id, first_name, last_name, email, phone, role, community_id, is_active, status")
    .eq("community_id", communityId);

  if (Array.isArray(roles) && roles.length > 0) {
    query = query.in("role", roles);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data || []).filter(isActiveProfile);
};

export const getCommunityAdmins = async (communityId) => {
  try {
    return await listProfilesForCommunity(communityId, [
      "superadmin",
      "admin",
      "manager",
    ]);
  } catch (error) {
    console.error("Error fetching community admins:", error);
    return [];
  }
};

export const getAllGuards = async (communityId) => {
  try {
    return await listProfilesForCommunity(communityId, ["guard"]);
  } catch (error) {
    console.error("Error fetching guards:", error);
    return [];
  }
};

export const getCommunityMembers = async (communityId) => {
  try {
    return await listProfilesForCommunity(communityId);
  } catch (error) {
    console.error("Error fetching community members:", error);
    return [];
  }
};

export const createEmergencyAlert = async (
  alertType,
  userLocation,
  currentProfile,
  communityId
) => {
  try {
    const emergencyType = EMERGENCY_TYPES[alertType];
    if (!emergencyType) {
      throw new Error("Invalid emergency type");
    }

    const reporterProfile = await getCurrentProfile(currentProfile);
    const resolvedCommunityId = communityId || reporterProfile.community_id;

    if (!resolvedCommunityId) {
      throw new Error("Community context missing for emergency alert");
    }

    let locationAttachment = null;
    try {
      const emergencyLocation = userLocation
        ? { locationAttachment: userLocation }
        : await LocationService.getEmergencyLocationData();
      locationAttachment = emergencyLocation.locationAttachment || null;
    } catch (locationError) {
      // Location is best-effort and should not block emergency creation.
      console.warn("Emergency location capture failed:", locationError?.message);
    }

    const insertPayload = {
      community_id: resolvedCommunityId,
      unit_id: reporterProfile.unit_id || null,
      user_id: reporterProfile.id,
      alert_type: emergencyType.alertType || alertType,
      title: emergencyType.title,
      description: emergencyType.adminMessage,
      priority: emergencyType.priority,
      status: "active",
    };

    const { data: alertData, error: insertError } = await supabase
      .from("emergency_alerts")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    const [admins, guards, members] = await Promise.all([
      getCommunityAdmins(resolvedCommunityId),
      getAllGuards(resolvedCommunityId),
      getCommunityMembers(resolvedCommunityId),
    ]);

    const stakeholderRows = [...admins, ...guards, ...members];
    const recipientRows = [];
    const uniqueRecipientIds = new Set();

    for (const profile of stakeholderRows) {
      const recipientUserId = profile?.user_id || profile?.id;
      if (!recipientUserId) {
        continue;
      }
      if (recipientUserId === reporterProfile.user_id || recipientUserId === reporterProfile.id) {
        continue;
      }
      if (uniqueRecipientIds.has(recipientUserId)) {
        continue;
      }

      uniqueRecipientIds.add(recipientUserId);
      recipientRows.push({
        alert_id: alertData.id,
        recipient_user_id: recipientUserId,
        recipient_role: profile?.role || null,
        delivered_at: new Date().toISOString(),
      });
    }

    if (recipientRows.length > 0) {
      const { error: recipientsError } = await supabase
        .from("emergency_alert_recipients")
        .upsert(recipientRows, {
          onConflict: "alert_id,recipient_user_id",
          ignoreDuplicates: false,
        });

      if (recipientsError) {
        console.error("Error tracking emergency recipients:", recipientsError);
      }
    }

    return {
      success: true,
      alertId: alertData.id,
      message: emergencyType.userMessage,
      notifiedCount: uniqueRecipientIds.size,
      locationData: locationAttachment,
    };
  } catch (error) {
    console.error("Error creating emergency alert:", error);
    return {
      success: false,
      error: error.message || "Failed to create emergency alert",
    };
  }
};

export const getCommunityAdminForChat = async (communityId) => {
  const admins = await getCommunityAdmins(communityId);
  return admins[0] || null;
};

export const getAvailableGuardForChat = async (communityId) => {
  const guards = await getAllGuards(communityId);
  return guards[0] || null;
};

export default {
  EMERGENCY_TYPES,
  createEmergencyAlert,
  getCommunityAdmins,
  getAllGuards,
  getCommunityMembers,
  getCommunityAdminForChat,
  getAvailableGuardForChat,
};
