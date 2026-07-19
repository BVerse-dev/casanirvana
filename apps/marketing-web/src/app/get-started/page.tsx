import type { Metadata } from "next";

import { OnboardingForm } from "@/components/OnboardingForm";

export const metadata: Metadata = { title: "Get Started", description: "Request Casa Nirvana onboarding for your community or management organization.", alternates: { canonical: "/get-started" } };

export default async function GetStartedPage({ searchParams }: { searchParams: Promise<{ email?: string | string[] }> }) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email.slice(0, 254) : "";
  return <main><section className="pxl-page-hero"><div className="pxl-page-hero__shape" aria-hidden="true" /><div className="pxl-container"><p className="pxl-kicker">Start with Casa Nirvana</p><h1>Bring your community operations into one connected platform.</h1><p className="pxl-page-hero__lead">Tell us about your organization and we will coordinate the right onboarding path.</p></div></section><section className="pxl-section pxl-onboarding-page"><div className="pxl-container pxl-onboarding-page__grid"><div><p className="pxl-kicker">What happens next</p><h2>A rollout shaped around your community.</h2><ol><li><span>01</span>We review your organization and community needs.</li><li><span>02</span>We confirm modules, scope and onboarding requirements.</li><li><span>03</span>We prepare a controlled rollout and training path.</li></ol></div><OnboardingForm initialEmail={email} /></div></section></main>;
}
