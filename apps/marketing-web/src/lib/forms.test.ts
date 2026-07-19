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
});
