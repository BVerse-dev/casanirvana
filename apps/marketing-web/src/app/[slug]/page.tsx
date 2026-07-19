import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactForm } from "@/components/ContactForm";
import { FaqAccordion } from "@/components/FaqAccordion";
import { MarketingPageView } from "@/components/MarketingPageView";
import { getPageBySlug, pages } from "@/content/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...pages.map((page) => ({ slug: page.slug })), { slug: "faqs" }, { slug: "contact-us" }, { slug: "privacy-policy" }, { slug: "terms-of-service" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  const legalTitles: Record<string, string> = { "faqs": "Frequently Asked Questions", "contact-us": "Contact Us", "privacy-policy": "Privacy Policy (Draft)", "terms-of-service": "Terms of Service (Draft)" };
  const title = page?.title || legalTitles[slug];
  if (!title) return {};
  const legalDraft = slug === "privacy-policy" || slug === "terms-of-service";
  return {
    title,
    description: page?.description || `${title} for the Casa Nirvana community operations platform.`,
    alternates: { canonical: `/${slug}/` },
    robots: legalDraft ? { index: false, follow: false } : undefined,
  };
}

export default async function MarketingRoute({ params }: PageProps) {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  if (page) return <MarketingPageView page={page} />;
  if (slug === "faqs") return <FaqPage />;
  if (slug === "contact-us") return <ContactPage />;
  if (slug === "privacy-policy") return <LegalPage title="Privacy Policy (Draft)" intro="A launch draft describing how Casa Nirvana handles information. This page remains subject to legal approval before release." sections={privacySections} />;
  if (slug === "terms-of-service") return <LegalPage title="Terms of Service (Draft)" intro="Draft terms for Casa Nirvana websites, applications and services. Legal approval is required before release." sections={termsSections} />;
  notFound();
}

function FaqPage() {
  return <main><section className="pxl-page-hero"><div className="pxl-page-hero__shape" aria-hidden="true" /><div className="pxl-container"><p className="pxl-kicker">Everything in one place</p><h1>Questions about Casa Nirvana, answered clearly.</h1><p className="pxl-page-hero__lead">Learn how the platform connects residents, guards and community operations.</p></div></section><section className="pxl-section pxl-faq-page"><div className="pxl-container"><FaqAccordion /></div></section></main>;
}

function ContactPage() {
  return <main><section className="pxl-page-hero"><div className="pxl-page-hero__shape" aria-hidden="true" /><div className="pxl-container"><p className="pxl-kicker">Let&apos;s talk</p><h1>Tell us what your community needs next.</h1><p className="pxl-page-hero__lead">For demos, partnerships and general enquiries, send a message to the Casa Nirvana team.</p></div></section><section className="pxl-section pxl-contact-page"><div className="pxl-container pxl-contact-page__grid"><div><p className="pxl-kicker">Start a conversation</p><h2>Hi, how are you doing today?</h2><p>Share a few details and we will connect you with the right person.</p><div className="pxl-contact-card"><strong>Prefer email?</strong><a href="mailto:hello@casanirvana.com">hello@casanirvana.com</a><span>Accra, Ghana</span></div></div><ContactForm /></div></section></main>;
}

function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: ReadonlyArray<readonly [string, string]> }) {
  return <main><section className="pxl-page-hero pxl-page-hero--compact"><div className="pxl-container"><p className="pxl-kicker">Casa Nirvana legal draft</p><h1>{title}</h1><p className="pxl-page-hero__lead">{intro}</p></div></section><article className="pxl-legal pxl-container">{sections.map(([heading, body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}</article></main>;
}

const privacySections = [
  ["Review status", "This draft is an implementation-aligned working document, not final legal approval. It must be reviewed for applicable jurisdictions, processors, retention periods, user rights and contact details before launch."],
  ["Information we collect", "We collect information supplied through public forms and information required to provide authenticated community services. Product data access is governed by role and community scope."],
  ["How information is used", "Information is used to operate, secure and improve Casa Nirvana, respond to enquiries, support community workflows and meet legal or contractual obligations."],
  ["Data sharing", "We do not sell personal information. Data is shared only with authorized community participants, service providers or authorities where required to deliver services or comply with law."],
  ["Security and retention", "We use access controls, audit records and operational safeguards appropriate to the information processed. Retention follows service, legal and security requirements."],
  ["Your choices", "You may request access, correction or deletion where applicable by contacting privacy@casanirvana.com."],
] as const;

const termsSections = [
  ["Review status", "These draft terms describe the current product model but are not approved for production publication. Legal review must confirm governing law, commercial terms, liability, acceptable use and dispute provisions before launch."],
  ["Using Casa Nirvana", "You must use Casa Nirvana lawfully, provide accurate information and protect your account credentials. Access may be limited by your role, organization and community."],
  ["Community administration", "Communities and authorized administrators are responsible for their operational policies, member authorization and configuration choices within the platform."],
  ["Payments and third-party services", "Payment and partner services may be governed by additional provider terms. A successful payment does not imply provider fulfillment until the platform confirms the applicable status."],
  ["Availability", "We work to provide reliable services but may perform maintenance, apply security controls or suspend access where necessary to protect users and the platform."],
  ["Contact", "Questions about these terms can be sent to legal@casanirvana.com."],
] as const;
