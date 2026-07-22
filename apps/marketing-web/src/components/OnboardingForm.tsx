"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { validateOnboardingPayload } from "@/lib/forms";

type FormStatus = { kind: "idle" | "pending" | "success" | "error"; message?: string; requestId?: string };

export function OnboardingForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "pending") return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const input = { ...Object.fromEntries(formData), modules: formData.getAll("modules"), accepted_terms: formData.get("accepted_terms") === "on" };
    const result = validateOnboardingPayload(input);
    setErrors(result.errors);
    if (!result.valid) return;
    setStatus({ kind: "pending", message: "Submitting your request…" });

    try {
      const response = await fetch("/api/onboarding/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(result.payload) });
      const data = await response.json().catch(() => null) as { message?: string; requestId?: string } | null;
      if (!response.ok) throw new Error(data?.message || "We could not submit your request. Please try again.");
      form.reset();
      setStatus({ kind: "success", message: "Your request has been received. We will contact you after review.", requestId: data?.requestId });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "We could not submit your request." });
    }
  }

  return (
    <form className="pxl-onboarding-form" onSubmit={submit} noValidate>
      <fieldset><legend>Your role</legend><div className="pxl-form-grid">
        <label><span>I am onboarding as</span><select name="requested_role" defaultValue="" aria-invalid={Boolean(errors.requested_role)}><option value="" disabled>Select role</option><option value="facility_manager">Facility manager</option><option value="agency_manager">Agency or property manager</option></select>{errors.requested_role ? <small>{errors.requested_role}</small> : null}</label>
        <label><span>Organization name</span><input name="organization_name" autoComplete="organization" placeholder="Organization name" aria-invalid={Boolean(errors.organization_name)} />{errors.organization_name ? <small>{errors.organization_name}</small> : null}</label>
      </div></fieldset>
      <fieldset><legend>Your details</legend><div className="pxl-form-grid">
        <label><span>First name</span><input name="first_name" autoComplete="given-name" placeholder="First name" aria-invalid={Boolean(errors.first_name)} />{errors.first_name ? <small>{errors.first_name}</small> : null}</label>
        <label><span>Last name</span><input name="last_name" autoComplete="family-name" placeholder="Last name" aria-invalid={Boolean(errors.last_name)} />{errors.last_name ? <small>{errors.last_name}</small> : null}</label>
        <label><span>Work email</span><input name="email" type="email" autoComplete="email" placeholder="name@organization.com" defaultValue={initialEmail} aria-invalid={Boolean(errors.email)} />{errors.email ? <small>{errors.email}</small> : null}</label>
        <label><span>Phone</span><input name="phone" type="tel" autoComplete="tel" placeholder="Phone number" aria-invalid={Boolean(errors.phone)} />{errors.phone ? <small>{errors.phone}</small> : null}</label>
      </div></fieldset>
      <fieldset><legend>Community details</legend><div className="pxl-form-grid">
        <label><span>Community name</span><input name="community_name" placeholder="Community or estate name" aria-invalid={Boolean(errors.community_name)} />{errors.community_name ? <small>{errors.community_name}</small> : null}</label>
        <label><span>Country</span><input name="country" autoComplete="country-name" placeholder="Country" aria-invalid={Boolean(errors.country)} />{errors.country ? <small>{errors.country}</small> : null}</label>
        <label><span>City</span><input name="city" autoComplete="address-level2" placeholder="City" aria-invalid={Boolean(errors.city)} />{errors.city ? <small>{errors.city}</small> : null}</label>
        <label><span>Approximate units</span><select name="unit_count" defaultValue=""><option value="">Not sure yet</option><option value="1-50">1–50</option><option value="51-150">51–150</option><option value="151-500">151–500</option><option value="501+">501+</option></select></label>
      </div><label className="pxl-form-message"><span>Address</span><textarea name="address" rows={3} autoComplete="street-address" placeholder="Community address" aria-invalid={Boolean(errors.address)} />{errors.address ? <small>{errors.address}</small> : null}</label></fieldset>
      <fieldset><legend>Rollout needs</legend><div className="pxl-form-grid">
        <label><span>Communities managed</span><select name="community_count" defaultValue="1"><option value="1">One community</option><option value="2-5">2–5 communities</option><option value="6-20">6–20 communities</option><option value="21+">21+ communities</option></select></label>
        <label><span>Target timeline</span><select name="target_timeline" defaultValue=""><option value="">Select timeline</option><option value="0-30 days">Within 30 days</option><option value="1-3 months">1–3 months</option><option value="3-6 months">3–6 months</option><option value="exploring">Exploring options</option></select></label>
        <label><span>How did you hear about us?</span><select name="referral_source" defaultValue=""><option value="">Select source</option><option>Referral</option><option>Search</option><option>Social media</option><option>Industry event</option><option>Community association</option><option>Other</option></select></label>
        <label><span>Referral code</span><input name="referral_code" placeholder="Optional" /></label>
      </div><div className="pxl-onboarding-modules"><span>Modules of interest</span>{["Resident experience", "Visitor and gate operations", "Facility operations", "Payments", "Marketplace"].map((module) => <label key={module}><input type="checkbox" name="modules" value={module} />{module}</label>)}</div><label className="pxl-form-message"><span>Additional context</span><textarea name="notes" rows={4} placeholder="Tell us about your current process, priorities or rollout constraints" /></label></fieldset>
      <label className="pxl-onboarding-consent"><input type="checkbox" name="accepted_terms" aria-invalid={Boolean(errors.accepted_terms)} /><span>I agree that Casa Nirvana may use these details to review this request, and I acknowledge the <Link href="/privacy-policy/">Privacy Policy</Link> and <Link href="/terms-of-service/">Terms of Service</Link>.</span>{errors.accepted_terms ? <small>{errors.accepted_terms}</small> : null}</label>
      <label className="pxl-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <button className="pxl-button pxl-button--dark" type="submit" disabled={status.kind === "pending"}>{status.kind === "pending" ? "Submitting…" : "Submit onboarding request"}<span aria-hidden="true">↗</span></button>
      <p className={`pxl-form-status is-${status.kind}`} role="status" aria-live="polite">{status.message}{status.requestId ? ` Reference: ${status.requestId}` : ""}</p>
    </form>
  );
}
