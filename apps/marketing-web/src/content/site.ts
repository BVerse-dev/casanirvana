export type MarketingSection = {
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: readonly string[];
  image?: string;
  tone?: "light" | "soft" | "dark" | "green";
};

export type MarketingPage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  sections: readonly MarketingSection[];
};

export const navigation = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Products", href: "/our-products" },
  { label: "Core Features", href: "/core-features" },
  { label: "Pricing", href: "/pricing-plans" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "FAQs", href: "/faqs" },
] as const;

export const productLinks = [
  { label: "Residents", href: "/residents" },
  { label: "Security Guards", href: "/security-guards" },
  { label: "Facility Managers", href: "/facility-managers" },
  { label: "Marketplace", href: "/marketplace" },
] as const;

export const productCards = [
  {
    title: "Resident experience",
    body: "Visitor passes, dues, maintenance, announcements, amenities and trusted services in one calm daily experience.",
    href: "/residents",
    number: "01",
  },
  {
    title: "Gate operations",
    body: "Verify passes, approve entries, record movement and coordinate incidents without losing the audit trail.",
    href: "/security-guards",
    number: "02",
  },
  {
    title: "Community control",
    body: "Manage residents, units, teams, payments, requests and communication from one operations workspace.",
    href: "/facility-managers",
    number: "03",
  },
  {
    title: "Lifestyle marketplace",
    body: "Connect residents to approved vendors, everyday services and community-specific offers.",
    href: "/marketplace",
    number: "04",
  },
] as const;

export const pages: readonly MarketingPage[] = [
  {
    slug: "about-us",
    title: "About Casa Nirvana",
    description: "The connected operating system for safer, better-run residential communities.",
    eyebrow: "Built for modern communities",
    heroTitle: "Technology should make community life feel effortless.",
    heroBody: "Casa Nirvana brings residents, guards, facility teams and trusted partners into one accountable ecosystem.",
    sections: [
      { eyebrow: "Our mission", title: "Safer communities. Clearer operations. Better living.", body: "We replace fragmented calls, paper logs and disconnected tools with one shared source of truth for daily community life.", image: "/assets/img-tab-5-h212.webp", tone: "soft" },
      { eyebrow: "Our approach", title: "Every role sees exactly what it needs.", body: "Residents get convenience, guards get operational clarity, managers get control, and partners get a trusted route into communities.", bullets: ["Tenant-safe access and accountability", "Real-time operational visibility", "Human-centered resident experiences"], tone: "light" },
      { eyebrow: "Our standard", title: "Trust is designed into the workflow.", body: "Every critical action is scoped, recorded and connected so communities can move faster without losing oversight.", tone: "dark" },
    ],
  },
  {
    slug: "our-products",
    title: "Casa Nirvana Products",
    description: "One platform serving every participant in the residential community ecosystem.",
    eyebrow: "One connected platform",
    heroTitle: "Purpose-built products that work better together.",
    heroBody: "Casa Nirvana connects the resident experience, gate security, facility operations and lifestyle services without creating separate islands of data.",
    sections: productCards.map((card, index) => ({ eyebrow: card.number, title: card.title, body: card.body, image: index === 0 ? "/assets/img-phone-h3-1.webp" : undefined, tone: index % 2 ? "soft" : "light" })),
  },
  {
    slug: "residents",
    title: "For Residents",
    description: "A simpler, safer way to manage everyday community life.",
    eyebrow: "Your community in one place",
    heroTitle: "Everything residents need, without the usual friction.",
    heroBody: "Create visitor passes, follow requests, pay community dues, receive announcements and access trusted services from one app.",
    sections: [
      { eyebrow: "Visitors", title: "Welcome guests without slowing down the gate.", body: "Generate secure visitor passes, share entry details and follow arrival or departure status in real time.", bullets: ["QR and entry-code passes", "Approval and lifecycle visibility", "Frequent visitor shortcuts"], image: "/assets/img-phone-h3-1.webp", tone: "soft" },
      { eyebrow: "Daily life", title: "Requests, payments and updates stay connected.", body: "Maintenance, complaints, dues, notices, amenities and emergency support are no longer scattered across chats and paper records.", tone: "light" },
      { eyebrow: "Personal Hub", title: "Useful services, already inside the experience.", body: "Access supported airtime, data, bills, transfers and community marketplace services with truthful availability and payment status.", tone: "green" },
    ],
  },
  {
    slug: "security-guards",
    title: "For Security Guards",
    description: "Fast, accountable gate and incident operations for security teams.",
    eyebrow: "Confidence at every entry point",
    heroTitle: "Give guards the right information at the exact moment they need it.",
    heroBody: "Verify visitors, record movement, coordinate emergencies and reach residents through auditable operational workflows.",
    sections: [
      { eyebrow: "Gate verification", title: "Scan, verify and decide with confidence.", body: "QR codes and entry codes resolve against live visitor records, host details and community scope.", bullets: ["Resident-created and walk-in passes", "Check-in and check-out records", "Cab, delivery and service flows"], tone: "soft" },
      { eyebrow: "Incident response", title: "Emergency actions stay visible to the whole response chain.", body: "Acknowledge, investigate, resolve and escalate incidents while preserving the operational history.", image: "/assets/img-build03-h21.png", tone: "light" },
      { eyebrow: "Directory", title: "Contact the right resident or administrator safely.", body: "Community-scoped directories and in-app communication reduce guesswork without exposing unrelated tenant data.", tone: "dark" },
    ],
  },
  {
    slug: "facility-managers",
    title: "For Facility Managers",
    description: "A complete operating view for residential facilities and communities.",
    eyebrow: "Operations without blind spots",
    heroTitle: "Run the entire community from one accountable workspace.",
    heroBody: "Bring residents, units, guards, visitors, requests, payments, notices and analytics into one clear operational system.",
    sections: [
      { eyebrow: "Community control", title: "Know who belongs, where they belong and what needs attention.", body: "Maintain trusted resident, unit, committee, guard and agency directories with scoped administrative access.", image: "/assets/img-build03-h21.png", tone: "soft" },
      { eyebrow: "Service operations", title: "Turn requests into measurable work.", body: "Assign and follow maintenance, complaints, help desk and service requests from intake through completion.", bullets: ["Clear ownership and status", "Resident-visible progress", "Operational reporting"], tone: "light" },
      { eyebrow: "Financial visibility", title: "Connect obligations, collections and settlement records.", body: "Issue community charges, monitor payments and keep gateway configuration behind secure backend controls.", tone: "green" },
    ],
  },
  {
    slug: "marketplace",
    title: "Casa Nirvana Marketplace",
    description: "Trusted products and services designed around community life.",
    eyebrow: "Convenience with community trust",
    heroTitle: "Bring reliable services closer to every resident.",
    heroBody: "Enable approved vendors, community-specific products and useful everyday services inside the same platform residents already trust.",
    sections: [
      { eyebrow: "Discovery", title: "A marketplace shaped by real community needs.", body: "Residents discover relevant products, services and providers without leaving the Casa Nirvana experience.", tone: "soft" },
      { eyebrow: "Vendor operations", title: "Approvals, catalog, orders and reviews stay manageable.", body: "Administrators control categories, products, vendors, order status and review visibility through scoped backend workflows.", image: "/assets/img-tab-5-h212.webp", tone: "light" },
      { eyebrow: "Trust", title: "Better choices through accountable participation.", body: "Community context, vendor review and controlled visibility create a safer route between residents and providers.", tone: "dark" },
    ],
  },
  {
    slug: "pricing-plans",
    title: "Pricing Plans",
    description: "Flexible Casa Nirvana plans for communities and management partners.",
    eyebrow: "Pricing built around your community",
    heroTitle: "Start with the operations you need. Scale without rebuilding.",
    heroBody: "Every community is different. We scope pricing around units, operational modules, onboarding and support requirements.",
    sections: [
      { eyebrow: "Essential", title: "Resident and visitor operations", body: "A focused starting point for communities replacing manual visitor, notice and request workflows.", bullets: ["Resident and guard apps", "Visitor lifecycle", "Notices and requests"], tone: "soft" },
      { eyebrow: "Professional", title: "Complete community operations", body: "Add payments, facility workflows, analytics, advanced administration and broader resident services.", bullets: ["Full operations dashboard", "Payments and Personal Hub", "Operational reporting"], tone: "light" },
      { eyebrow: "Enterprise", title: "Multi-community and partner scale", body: "Custom onboarding, controls, integrations and support for agencies or portfolios managing multiple communities.", bullets: ["Portfolio-level governance", "Custom integrations", "Dedicated rollout support"], tone: "dark" },
    ],
  },
  {
    slug: "core-features",
    title: "Core Features",
    description: "The connected capabilities behind safer, smarter communities.",
    eyebrow: "Designed as one system",
    heroTitle: "Every workflow shares the same trusted community context.",
    heroBody: "Identity, tenant scope, visitor operations, communication, payments and service delivery work together instead of creating duplicate records.",
    sections: [
      { title: "Visitor and gate operations", body: "Pass creation, verification, approvals, check-in, check-out and audit history across resident and guard experiences.", tone: "soft" },
      { title: "Requests and communication", body: "Maintenance, complaints, notices, help desk, chat, calls, notifications and emergency coordination.", tone: "light" },
      { title: "Payments and lifestyle services", body: "Community obligations, hosted checkout, Personal Hub services, marketplace operations and truthful fulfillment state.", tone: "green" },
    ],
  },
];

export const getPageBySlug = (slug: string) => pages.find((page) => page.slug === slug);
