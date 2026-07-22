"use client";

import { FormEvent, useState } from "react";

import { validateContactPayload } from "@/lib/forms";

type FormStatus = { kind: "idle" | "pending" | "success" | "error"; message?: string };

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "pending") return;
    const form = event.currentTarget;
    const result = validateContactPayload(Object.fromEntries(new FormData(form)));
    setErrors(result.errors);
    if (!result.valid) return;
    setStatus({ kind: "pending", message: "Sending your message…" });

    try {
      const response = await fetch("/api/contact/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(result.payload) });
      const data = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message || "We could not send your message. Please try again.");
      form.reset();
      setStatus({ kind: "success", message: "Thank you. The Casa Nirvana team will get back to you shortly." });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "We could not send your message." });
    }
  }

  return (
    <form className="pxl-contact-form-3" onSubmit={submit} noValidate>
      <div className="pxl-form-grid">
        <label><span>Your name</span><input name="name" autoComplete="name" placeholder="Your Name" aria-invalid={Boolean(errors.name)} />{errors.name ? <small>{errors.name}</small> : null}</label>
        <label><span>Your phone</span><input name="phone" type="tel" autoComplete="tel" placeholder="Your Phone" /></label>
        <label><span>Your email</span><input name="email" type="email" autoComplete="email" placeholder="Your Email" aria-invalid={Boolean(errors.email)} />{errors.email ? <small>{errors.email}</small> : null}</label>
        <label><span>Reason for enquiry</span><select name="reason" defaultValue="" aria-invalid={Boolean(errors.reason)}><option value="" disabled>Reason for enquiry</option><option>Book a demo</option><option>Pricing enquiry</option><option>Partnership</option><option>Support or existing onboarding</option><option>Press and media</option><option>General enquiry</option></select>{errors.reason ? <small>{errors.reason}</small> : null}</label>
      </div>
      <label className="pxl-form-message"><span>Message</span><textarea name="message" rows={6} placeholder="Tell us about your community or project" aria-invalid={Boolean(errors.message)} />{errors.message ? <small>{errors.message}</small> : null}</label>
      <label className="pxl-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <button className="pxl-button pxl-button--dark" type="submit" disabled={status.kind === "pending"}>{status.kind === "pending" ? "Sending…" : "Send message"}<span aria-hidden="true">↗</span></button>
      <p className={`pxl-form-status is-${status.kind}`} role="status" aria-live="polite">{status.message}</p>
    </form>
  );
}
