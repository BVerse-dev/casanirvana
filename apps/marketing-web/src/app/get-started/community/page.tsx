import type { Metadata } from "next";
import Link from "next/link";

import { OnboardingForm } from "@/components/OnboardingForm";

export const metadata: Metadata = {
  title: "Community Onboarding",
  description: "Request a guided Casa Nirvana rollout for your community or management organization.",
  alternates: { canonical: "/get-started/community/" },
};

export default async function CommunityOnboardingPage({ searchParams }: { searchParams: Promise<{ email?: string | string[] }> }) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email.slice(0, 254) : "";

  return (
    <main>
      <section className="pxl-page-hero pxl-page-hero--compact">
        <div className="pxl-container">
          <p className="pxl-kicker">Community onboarding</p>
          <h1>Let&apos;s prepare your community for Casa Nirvana.</h1>
          <p className="pxl-page-hero__lead">Share the operational context we need to review scope, access and rollout requirements.</p>
        </div>
      </section>
      <section className="pxl-section pxl-onboarding-page">
        <div className="pxl-container pxl-onboarding-page__grid">
          <div>
            <Link className="pxl-start-back" href="/get-started/">← Choose another path</Link>
            <p className="pxl-kicker">What happens next</p>
            <h2>A controlled rollout shaped around your community.</h2>
            <ol>
              <li><span>01</span>We review your organization, community and operating needs.</li>
              <li><span>02</span>We confirm modules, scope, access and onboarding requirements.</li>
              <li><span>03</span>We coordinate setup, invitations, training and launch readiness.</li>
            </ol>
          </div>
          <OnboardingForm initialEmail={email} />
        </div>
      </section>
    </main>
  );
}
