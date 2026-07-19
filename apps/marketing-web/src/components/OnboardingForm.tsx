"use client";

import { FormEvent, useState } from "react";

import { validateOnboardingPayload } from "@/lib/forms";

type FormStatus = { kind: "idle" | "pending" | "success" | "error"; message?: string };

export function OnboardingForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "pending") return;
    const form = event.currentTarget;
    const result = validateOnboardingPayload(Object.fromEntries(new FormData(form)));
    setErrors(result.errors);
    if (!result.valid) return;
    setStatus({ kind: "pending", message: "Submitting your request…" });

    try {
      const response = await fetch("/api/onboarding/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(result.payload) });
      const data = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message || "We could not submit your request. Please try again.");
      form.reset();
      setStatus({ kind: "success", message: "Your request has been received. We will contact you after review." });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "We could not submit your request." });
    }
  }

  return (
    <form className="pxl-onboarding-form" onSubmit={submit} noValidate>
      <div className="pxl-form-grid">
        <label><span>I am onboarding as</span><select name="requested_role" defaultValue="" aria-invalid={Boolean(errors.requested_role)}><option value="" disabled>Select role</option><option value="facility_manager">Facility manager</option><option value="agency_manager">Agency manager</option></select>{errors.requested_role ? <small>{errors.requested_role}</small> : null}</label>
        <label><span>Organization name</span><input name="organization_name" autoComplete="organization" placeholder="Organization name" /></label>
        <label><span>First name</span><input name="first_name" autoComplete="given-name" placeholder="First name" aria-invalid={Boolean(errors.first_name)} />{errors.first_name ? <small>{errors.first_name}</small> : null}</label>
        <label><span>Last name</span><input name="last_name" autoComplete="family-name" placeholder="Last name" aria-invalid={Boolean(errors.last_name)} />{errors.last_name ? <small>{errors.last_name}</small> : null}</label>
        <label><span>Work email</span><input name="email" type="email" autoComplete="email" placeholder="name@organization.com" defaultValue={initialEmail} aria-invalid={Boolean(errors.email)} />{errors.email ? <small>{errors.email}</small> : null}</label>
        <label><span>Phone</span><input name="phone" type="tel" autoComplete="tel" placeholder="Phone number" /></label>
        <label><span>Community name</span><input name="community_name" placeholder="Community name" /></label>
        <label><span>City</span><input name="city" autoComplete="address-level2" placeholder="City" /></label>
        <label><span>Country</span><input name="country" autoComplete="country-name" placeholder="Country" /></label>
        <label><span>Referral code</span><input name="referral_code" placeholder="Optional" /></label>
      </div>
      <label className="pxl-form-message"><span>Address</span><textarea name="address" rows={3} autoComplete="street-address" placeholder="Organization or community address" /></label>
      <label className="pxl-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <button className="pxl-button pxl-button--dark" type="submit" disabled={status.kind === "pending"}>{status.kind === "pending" ? "Submitting…" : "Submit onboarding request"}<span aria-hidden="true">↗</span></button>
      <p className={`pxl-form-status is-${status.kind}`} role="status" aria-live="polite">{status.message}</p>
    </form>
  );
}
