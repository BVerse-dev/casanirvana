import { describe, expect, it } from "vitest";

import { validateContactPayload, validateOnboardingPayload } from "./forms";

describe("marketing form validation", () => {
  it("accepts and normalizes a valid contact request", () => {
    const result = validateContactPayload({ name: "  Ama Mensah ", email: " AMA@example.com ", reason: "Demo", message: "Please show our management team the platform." });
    expect(result.valid).toBe(true);
    expect(result.payload.email).toBe("ama@example.com");
  });

  it("rejects incomplete onboarding requests", () => {
    const result = validateOnboardingPayload({ requested_role: "resident", first_name: "A", email: "wrong" });
    expect(result.valid).toBe(false);
    expect(result.errors.requested_role).toBeTruthy();
    expect(result.errors.last_name).toBeTruthy();
  });

  it("accepts a qualified manager request and records rollout metadata", () => {
    const result = validateOnboardingPayload({ requested_role: "facility_manager", first_name: "Ama", last_name: "Mensah", email: "ama@example.com", phone: "+233200000000", organization_name: "Casa Estates", community_name: "Casa One", country: "Ghana", city: "Accra", address: "1 Community Road", community_count: "2-5", unit_count: "151-500", modules: ["Resident experience", "Payments"], target_timeline: "1-3 months", referral_source: "Referral", accepted_terms: true });
    expect(result.valid).toBe(true);
    expect(result.payload.metadata.modules).toEqual(["Resident experience", "Payments"]);
  });

  it("requires explicit onboarding acknowledgement", () => {
    const result = validateOnboardingPayload({ requested_role: "agency_manager", first_name: "Kojo", last_name: "Asante", email: "kojo@example.com", phone: "+233200000001", organization_name: "Agency", community_name: "Estate", country: "Ghana", city: "Accra", address: "2 Community Road" });
    expect(result.valid).toBe(false);
    expect(result.errors.accepted_terms).toBeTruthy();
  });
});
