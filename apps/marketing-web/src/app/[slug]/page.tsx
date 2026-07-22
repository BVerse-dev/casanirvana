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
  if (slug === "privacy-policy") return <LegalPage title="Privacy Policy (Draft)" intro="This implementation-aligned notice explains how Casa Nirvana handles personal data across its website and community products. Legal approval is required before release." sections={privacySections} />;
  if (slug === "terms-of-service") return <LegalPage title="Terms of Service (Draft)" intro="Draft terms for Casa Nirvana websites, applications and services. Legal approval is required before release." sections={termsSections} />;
  notFound();
}

function FaqPage() {
  return <main><section className="pxl-page-hero"><div className="pxl-page-hero__shape" aria-hidden="true" /><div className="pxl-container"><p className="pxl-kicker">Everything in one place</p><h1>Questions about Casa Nirvana, answered clearly.</h1><p className="pxl-page-hero__lead">Learn how the platform connects residents, guards and community operations.</p></div></section><section className="pxl-section pxl-faq-page"><div className="pxl-container"><FaqAccordion /></div></section></main>;
}

function ContactPage() {
  return <main><section className="pxl-page-hero"><div className="pxl-page-hero__shape" aria-hidden="true" /><div className="pxl-container"><p className="pxl-kicker">Let&apos;s talk</p><h1>Tell us what your community needs next.</h1><p className="pxl-page-hero__lead">For demos, partnerships and general enquiries, send a message to the Casa Nirvana team.</p></div></section><section className="pxl-section pxl-contact-page"><div className="pxl-container pxl-contact-page__grid"><div><p className="pxl-kicker">Start a conversation</p><h2>Hi, how are you doing today?</h2><p>Share a few details and we will connect you with the right person.</p><div className="pxl-contact-card"><strong>Prefer email?</strong><a href="mailto:hello@casanirvana.app">hello@casanirvana.app</a><span>Accra, Ghana</span></div></div><ContactForm /></div></section></main>;
}

function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: ReadonlyArray<readonly [string, string]> }) {
  return <main><section className="pxl-page-hero pxl-page-hero--compact"><div className="pxl-container"><p className="pxl-kicker">Casa Nirvana legal draft</p><h1>{title}</h1><p className="pxl-page-hero__lead">{intro}</p></div></section><article className="pxl-legal pxl-container">{sections.map(([heading, body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}</article></main>;
}

const privacySections = [
  ["Review status and scope", "Last updated 22 July 2026. This working notice covers the Casa Nirvana website, resident and guard applications, facility-management tools and related services. It reflects the current implementation but remains subject to legal approval, processor review and confirmation of the final retention schedule before launch."],
  ["Who is responsible for your data", "Casa Nirvana determines how information submitted through its public website and direct support channels is handled. For community-service records, the relevant community or organization may determine the purpose of processing while Casa Nirvana processes information to provide the platform. Contractual roles and responsibilities must be confirmed during onboarding."],
  ["Information we collect", "Depending on your role and enabled modules, information may include identity and contact details; community, unit, membership and role records; visitor and access activity; requests, complaints, incidents and emergency records; amenity bookings; notices and messages; marketplace, order and payment-status records; files you choose to attach; and support or onboarding communications."],
  ["Website and technical information", "Public forms collect the details you submit, such as your name, email address, phone number, organization, enquiry reason and message. The service may also process device, browser, network, authentication, diagnostic and audit information needed to deliver, secure and troubleshoot the platform."],
  ["How information is used", "Information is used to authenticate users, enforce role and community access, operate enabled workflows, communicate service and security updates, respond to enquiries, provide support, prevent misuse, maintain auditability, improve reliability and meet applicable legal or contractual obligations."],
  ["How information is shared", "Casa Nirvana does not sell personal data. Information may be shared with authorized community participants according to their role, with contracted providers supporting hosting, database, authentication, communications, email, payments or digital services, and with professional advisers or public authorities where permitted or required by law."],
  ["International processing", "Some contracted technology providers may process information outside Ghana. Before launch, Casa Nirvana must confirm the locations and safeguards used for these transfers and document the applicable contractual and legal protections."],
  ["Retention", "Information is retained only for as long as necessary for the purpose collected, the active service relationship, security and audit needs, dispute resolution and legal obligations. The final category-specific retention schedule and deletion process must be approved before launch."],
  ["Security", "Casa Nirvana uses authenticated access, role and community scoping, database access controls, audit records and operational safeguards designed to protect personal data. No service can guarantee absolute security, and suspected incidents should be reported promptly to privacy@casanirvana.app."],
  ["Your rights and choices", "Subject to applicable law, you may request information about processing, access to your personal data, correction of inaccurate data, objection to certain processing, or deletion or restriction where available. Requests can be sent to privacy@casanirvana.app. You may also raise a concern with Ghana's Data Protection Commission."],
  ["Children's information", "Casa Nirvana is not intended for children to create independent accounts. A community or authorized adult may provide limited household or visitor information involving a child where required for community operations; the responsible community must ensure it has an appropriate lawful basis and applies suitable safeguards."],
  ["Changes and contact", "Material updates will be posted on this page with a revised date. Privacy questions and rights requests should be sent to privacy@casanirvana.app. General product enquiries can be sent to hello@casanirvana.app."],
] as const;

const termsSections = [
  ["Review status", "These draft terms describe the current product model but are not approved for production publication. Legal review must confirm governing law, commercial terms, liability, acceptable use and dispute provisions before launch."],
  ["Using Casa Nirvana", "You must use Casa Nirvana lawfully, provide accurate information and protect your account credentials. Access may be limited by your role, organization and community."],
  ["Community administration", "Communities and authorized administrators are responsible for their operational policies, member authorization and configuration choices within the platform."],
  ["Payments and third-party services", "Payment and partner services may be governed by additional provider terms. A successful payment does not imply provider fulfillment until the platform confirms the applicable status."],
  ["Availability", "We work to provide reliable services but may perform maintenance, apply security controls or suspend access where necessary to protect users and the platform."],
  ["Contact", "Questions about these terms can be sent to legal@casanirvana.com."],
] as const;
