import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get Started",
  description: "Choose the right Casa Nirvana onboarding path for residents or community management teams.",
  alternates: { canonical: "/get-started/" },
};

export default async function GetStartedPage({ searchParams }: { searchParams: Promise<{ email?: string | string[] }> }) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email.slice(0, 254) : "";
  const managerHref = email ? `/get-started/community/?email=${encodeURIComponent(email)}` : "/get-started/community/";

  return (
    <main>
      <section className="pxl-page-hero pxl-start-gateway-hero">
        <div className="pxl-page-hero__shape" aria-hidden="true" />
        <div className="pxl-container">
          <p className="pxl-kicker">Start with Casa Nirvana</p>
          <h1>Choose the path that fits your role.</h1>
          <p className="pxl-page-hero__lead">Residents join an existing community in the mobile app. Community teams request a guided rollout here.</p>
        </div>
      </section>
      <section className="pxl-section pxl-start-gateway">
        <div className="pxl-container">
          <div className="pxl-start-gateway__grid">
            <article className="pxl-start-card pxl-start-card--resident">
              <span className="pxl-start-card__number">01</span>
              <p className="pxl-kicker">Residents</p>
              <h2>I live in a community.</h2>
              <p>Create an account, join an existing community or add another community through the Casa Nirvana resident app.</p>
              <Link className="pxl-button pxl-button--dark" href="/get-started/residents/">Join your community <span aria-hidden="true">↗</span></Link>
            </article>
            <article className="pxl-start-card pxl-start-card--manager">
              <span className="pxl-start-card__number">02</span>
              <p className="pxl-kicker">Community teams</p>
              <h2>I manage communities.</h2>
              <p>Tell us about your community, facility or management organization so we can prepare the right onboarding path.</p>
              <Link className="pxl-button pxl-button--dark" href={managerHref}>Set up your community <span aria-hidden="true">↗</span></Link>
            </article>
          </div>
          <aside className="pxl-start-security-note">
            <strong>Do you work in community security?</strong>
            <p>Guard accounts are created or invited by an authorized community manager. Contact your manager if you need access.</p>
            <Link href="/security-guards/">See the guard experience</Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
