"use client";

import Link from "next/link";
import { useState } from "react";

const flows = {
  new: [
    ["Download the app", "Install the Casa Nirvana resident app on your phone."],
    ["Create your account", "Register and complete the required email or phone verification."],
    ["Find your community", "Search for your community and select the property unit connected to you."],
    ["Request approval", "Submit the join request for review by an authorized community manager."],
  ],
  existing: [
    ["Sign in", "Open the resident app and sign in to your existing Casa Nirvana account."],
    ["Open Join Community", "Use the community option from your home or profile experience."],
    ["Choose community and unit", "Search for the community, select the unit and add any verification note."],
    ["Request approval", "Submit the request and wait for the community manager to approve access."],
  ],
} as const;

export function ResidentOnboardingGuide({ appUrl }: { appUrl: string }) {
  const [flow, setFlow] = useState<keyof typeof flows>("new");

  return (
    <main>
      <section className="pxl-page-hero pxl-page-hero--compact pxl-onboarding-hero">
        <div className="pxl-container">
          <p className="pxl-kicker pxl-reveal">Resident onboarding</p>
          <h1 className="pxl-reveal pxl-reveal--delay-1">Join the community you call home.</h1>
          <p className="pxl-page-hero__lead pxl-reveal pxl-reveal--delay-2">Use the Casa Nirvana resident app to create your account or connect an existing account to another community.</p>
        </div>
      </section>
      <section className="pxl-section pxl-resident-start">
        <div className="pxl-container">
          <div className="pxl-resident-start__tabs pxl-onboarding-rise" role="tablist" aria-label="Resident onboarding status">
            <button type="button" role="tab" aria-selected={flow === "new"} className={flow === "new" ? "is-active" : ""} onClick={() => setFlow("new")}>I&apos;m a new user</button>
            <button type="button" role="tab" aria-selected={flow === "existing"} className={flow === "existing" ? "is-active" : ""} onClick={() => setFlow("existing")}>I already have an account</button>
          </div>
          <div className="pxl-resident-start__steps" role="tabpanel" key={flow}>
            {flows[flow].map(([title, body], index) => (
              <article key={title} style={{ "--pxl-step-index": index } as React.CSSProperties}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h2>{title}</h2><p>{body}</p></div>
              </article>
            ))}
          </div>
          <div className="pxl-resident-start__action">
            <div><p className="pxl-kicker">Community not listed?</p><h2>You can still submit a manual request in the app.</h2><p>Enter the community and unit details for manager review instead of creating a duplicate community record.</p></div>
            {appUrl ? <a className="pxl-button pxl-button--dark" href={appUrl}>Open resident app <span aria-hidden="true">↗</span></a> : <span className="pxl-app-link-pending">Resident app download link is being prepared.</span>}
          </div>
          <p className="pxl-resident-start__help">Need help with an existing request? <Link href="/contact-us/?reason=Support">Contact the Casa Nirvana team.</Link></p>
        </div>
      </section>
    </main>
  );
}
