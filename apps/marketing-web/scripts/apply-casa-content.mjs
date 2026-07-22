import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const appRoot = path.resolve(import.meta.dirname, "..");
const publicRoot = path.join(appRoot, "public");
const manifestPath = path.join(publicRoot, "wordpress-snapshot", "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const canonicalSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://casanirvana.app").replace(/\/$/, "");

const snapshotSeo = {
  "/": { title: "Connected Community Operations", description: "Casa Nirvana connects residents, security guards and facility managers through visitor, request, communication and community operations workflows." },
  "/about-us/": { title: "About Casa Nirvana", description: "Learn how Casa Nirvana connects residents, guards and facility teams through accountable, community-scoped technology." },
  "/our-products/": { title: "Casa Nirvana Products", description: "Explore connected Casa Nirvana experiences for residents, security guards, facility managers and configured community marketplace services." },
  "/residents/": { title: "Casa Nirvana for Residents", description: "Manage visitors, notices, requests, amenities, marketplace activity and supported community services from one resident experience." },
  "/security-guards/": { title: "Casa Nirvana for Security Guards", description: "Verify visitor passes, record entry activity, coordinate incidents and communicate through community-scoped guard workflows." },
  "/facility-managers/": { title: "Casa Nirvana for Facility Managers", description: "Coordinate communities, units, residents, guards, visitors, requests, amenities and enabled modules from one management workspace." },
  "/marketplace/": { title: "Casa Nirvana Marketplace", description: "Discover configured community products and services, manage a cart and follow supported orders through the resident marketplace." },
  "/pricing-plans/": { title: "Casa Nirvana Pricing", description: "Discuss contact-led Casa Nirvana pricing based on community size, enabled modules, onboarding and support requirements." },
  "/core-features/": { title: "Casa Nirvana Core Features", description: "Explore visitor operations, requests, amenities, communication, marketplace, payments and role-aware community administration." },
  "/faqs/": { title: "Casa Nirvana FAQs", description: "Answers about Casa Nirvana users, rollout, visitor management, configured payments, integrations and community modules." },
  "/contact-us/": { title: "Contact Casa Nirvana", description: "Contact Casa Nirvana about product demos, community onboarding, partnerships and general enquiries." },
};

const sharedLaunchReplacements = [
  ["Send Money", "Get Started"],
  ["Log Out", "Book a Demo"],
  ["Blog", "Pricing"],
  ["essential", "Casa Nirvana"],
  ["refund policy", "privacy policy"],
  ["Our team", "About us"],
  ["Documentation", "Product overview"],
  ["Getting started", "Plan your rollout"],
  ["Components", "Core features"],
  ["API", "Contact"],
  ["Templates", "Products"],
  ["Public Roadmap", "FAQs"],
  ["Cart", "Marketplace"],
  ["(0 items)", "Resident access"],
  ["Your cart is empty", "Marketplace availability follows community configuration"],
  ["Browse Shop", "Explore products"],
  ["Products & services are important. They might sell dairy, meat, maybe even eco-friendly manure compost. Including a CSA program…", "Connected tools help residents, guards and facility teams coordinate daily community life with clearer status and accountability."],
  ["Products & services are important. They might sell dairy, meat, maybe even eco-friendly manure compost. Including a CSA program&#8230;", "Connected tools help residents, guards and facility teams coordinate daily community life with clearer status and accountability."],
  ["Products &amp; services are important. They might sell dairy, meat, maybe even eco-friendly manure compost. Including a CSA program&#8230;", "Connected tools help residents, guards and facility teams coordinate daily community life with clearer status and accountability."],
  ["/about-company/", "/about-us/"],
  ["https://themeforest.net/user/bravis-themes/portfolio", "/"],
  ["/blog-standard/", "/pricing-plans/"],
  ["/our-team/", "/about-us/"],
  ["/team-details/", "/about-us/"],
  ["/careers/", "/about-us/"],
  ["/terms-and-conditions/", "/terms-of-service/"],
  ["/refund-policy/", "/privacy-policy/"],
  ["/documentation/", "/our-products/"],
  ["/getting-started/", "/get-started/"],
  ["/components/", "/core-features/"],
  ["/templates/", "/our-products/"],
  ["/public-roadmap/", "/faqs/"],
  ["/send-money/", "/get-started/"],
  ["/shop/", "/marketplace/"],
];

// These replacements intentionally run after the original route transforms. They
// make the content pass idempotent when an earlier run has already replaced a
// fragment inside a larger Saliver sentence.
const finalRouteReplacements = {
  "/": [
    ["Use a comprehensive stock screener tools suite with a connected operations and key takeaways to elevate your stock screening experience to a new level.", "Manage visitors, requests, notices and community activity through connected, role-aware workflows."],
    ["Use a comprehensive stock screener tools suite with a\u00a0connected operations\u00a0and\u00a0key takeaways\u00a0to elevate your stock screening experience to a new level.", "Manage visitors, requests, notices and community activity through connected, role-aware workflows."],
  ],
  "/security-guards/": [
    ["One central hub for your assets and team", "Faster, accountable gate operations for every shift"],
  ],
  "/facility-managers/": [
    ["Effortless email & marketing automation", "Coordinate every community operation from one workspace"],
    ["Effortless email &#038; marketing automation", "Coordinate every community operation from one workspace"],
  ],
  "/marketplace/": [
    ["One central hub for your assets and team", "Discover trusted services for everyday community life"],
  ],
  "/pricing-plans/": [
    ["Evolving powerful concepts into tangible & relatable", "Pricing shaped around your community"],
    ["Evolving powerful concepts into tangible &#038; relatable", "Pricing shaped around your community"],
  ],
  "/faqs/": [
    ["General & Business Strategy", "Platform and rollout"],
    ["General &#038; Business Strategy", "Platform and rollout"],
  ],
};

const routeTransforms = {
  "/": {
    replacements: [
      ["download now", "explore the apps"],
      ["Start for free", "Plan your rollout"],
      ["14-day trial, no credit card required.", "A guided rollout shaped around your community."],
      ["Enterprise-Grade Data Protection", "Community-Scoped Access Controls"],
      ["Learn more and quicker then other platform", "Coordinate daily community work in one place"],
      ["Use a comprehensive stock screener tools suite with a scoring mechanism and key takeaways to elevate your stock screening experience to a new level.", "Manage visitors, requests, notices and community activity through connected, role-aware workflows."],
      ["scoring mechanism", "connected operations"],
      ["Boost team efficiency with automated workflows", "Route community activity through clear workflows"],
      ["Instantly route mesages to the correct shared inbox", "Keep requests and updates visible to the right people"],
      ["Simplify processes with 1-click macros", "Reduce paper logs and disconnected follow-ups"],
      ["Upgrade your knowledge instantly.", "Keep every role informed."],
      ["Accelerate your learning journey.", "Move community work forward."],
      ["20+", "One"],
      ["Daily", "Shared"],
      ["impressions", "community context"],
      ["More Happy Residents", "Resident experience"],
      ["Residents Connected", "Authorized community access"],
      ["Community Services", "Coordinated community services"],
      ["Communities Served", "Role-aware operations"],
      ["Satisfaction Rate", "Accountable activity history"],
      ["Happy user rating", "Clear operational status"],
      ["Save time and get more done in Saliver", "Save time and coordinate more with Casa Nirvana"],
      ["QR visitor passes, patrol logging, and emergency alerts keep communities protected 24/7.", "QR visitor passes, gate verification and emergency coordination give security teams clearer operational context."],
      ["try for free", "plan your rollout"],
      ["+ 12%", "Clear"],
      ["Customer Satisfaction (CSAT): 4.7/5", "Community activity with visible status and ownership"],
      ["Our platform integrates with trusted payment gateways, telecom providers, utility companies and access control devices, giving your community everything it needs without switching between apps.", "Casa Nirvana connects configured payment, service and access workflows in one community experience, with availability controlled by live provider and community settings."],
      ["Automate collections and process transactions through integrated gateways.", "Manage supported charges and payment activity through configured hosted checkout workflows."],
      ["Recharge airtime and data; conveniently pay water and electricity bills directly.", "Access only the airtime, data and bill categories exposed by the configured live service catalog."],
      ["Your community\n\tin your pocket, wherever you go. Download Now.", "Your community\n\tin your pocket, wherever you go."],
      ["Scan QR Code & download", "Mobile experiences"],
      ["Get the\n\tCasa Nirvana app for\n\tiOS or Android.", "Focused Casa Nirvana experiences for residents and guards."],
      ["blog & insights", "platform insights"],
      ["Latest news and\n\tupdates. Stay informed and inspired.", "Explore how connected workflows support safer, better-run communities."],
      ["Regenerative grazing boosts soil health rapidly.", "Visitor management without paper gate logs."],
      ["Rotational grazing improves water retention.", "Clearer communication across community roles."],
      ["Managed grazing enhances biodiversity.", "Requests and operations in one shared context."],
      ["Rotational grazing supports ecosystem health", "Structured gate operations for modern communities"],
      ["Planned grazing boosts native species", "A calmer resident experience for everyday needs"],
      ["Sustainable grazing restores habitats", "Accountable facility operations from request to resolution"],
      ["March 17, 2025", "Product overview"],
      ["April 28, 2025", "Product overview"],
      ["Start 14-day free trial", "Plan your community rollout"],
      ["No credit card required", "Talk to our team"],
      ["Cancel Anytime", "Explore Casa Nirvana"],
      ["documentation", "platform overview"],
      ["Products & services are important. They might sell dairy, meat, maybe even eco-friendly manure compost. Including a CSA program&#8230;", "Connected tools help residents, guards and facility teams coordinate daily community life with clearer status and accountability."],
      ["Our team", "About us"],
      ["refund policy", "privacy policy"],
      ["Documentation", "Product overview"],
      ["Getting started", "Plan your rollout"],
      ["Components", "Core features"],
      ["API", "Contact"],
      ["Templates", "Products"],
      ["Public Roadmap", "FAQs"],
      ["Get weekly newsletter and updates", "Get Casa Nirvana product updates"],
      ["2025 © All rights reserved by", "2026 © All rights reserved by"],
      ["Bravis-Themes", "Casa Nirvana"],
      ["Browse Shop", "Explore products"],
      ["/regenerative-grazing-boosts-soil-health-rapidly/", "/core-features/"],
      ["/rotational-grazing-improves-water-retention/", "/residents/"],
      ["/managed-grazing-enhances-biodiversity/", "/facility-managers/"],
      ["/rotational-grazing-supports-ecosystem-health/", "/security-guards/"],
      ["/planned-grazing-boosts-native-species/", "/residents/"],
      ["/sustainable-grazing-restores-habitats/", "/facility-managers/"],
      ["/shop/", "/our-products/"],
    ],
  },
  "/about-us/": {
    replacements: [
      ["Start for free", "Plan your rollout"],
      ["Casa Nirvana envisions a future where estates, apartments and gated complexes across the globe run on a single, intelligent ecosystem that keeps residents informed, secure and engaged. We strive to lead the way in community technology by continuously innovating and building tools that truly enhance everyday living.", "Casa Nirvana envisions estates, apartments and gated communities operating through connected, role-aware workflows that keep authorized residents and teams informed. We build practical tools around the realities of everyday community life."],
      ["Our mission is to deliver a comprehensive platform that blends real‑time security, streamlined payments, transparent communication and personalised lifestyle tools. By listening to our cherished users and partnering with leading service providers, we ensure Casa Nirvana meets the unique needs of every gated community in a smart way.", "Our mission is to connect visitor operations, community requests, communication and configured services in one accountable platform. Each role receives the tools and community-scoped access needed for its daily responsibilities."],
      ["One intelligent ecosystem connecting every service you need.", "One connected platform for the community workflows you enable."],
      ["for designers", "role-aware operations"],
      ["Integration capabilities include", "Connected capabilities include"],
      ["RESTful APIs", "Community-scoped workflows"],
      ["Automation & workflow features include a drag & drop builder, automated task assignments, conditional with good triggers, and api integrations.", "Module settings, role-aware access and shared operational records help communities coordinate work without disconnected tools."],
      ["Boost team efficiency with automated workflows", "Coordinate community activity through clear workflows"],
      ["Instantly route mesages to the correct shared inbox", "Keep requests and updates visible to authorized teams"],
      ["Simplify processes with 1-click macros", "Reduce paper logs and disconnected follow-ups"],
      ["Real communities. Real results.", "Designed around real community operations."],
      ["Trusted by residents, communities and partners.", "Built for residents, guards and facility teams."],
      ["From gated estates to high‑rise apartments, communities choose Casa Nirvana to create safer, more connected environments. We work hand‑in‑hand with management companies, service vendors and local businesses to deliver a complete experience that everyone can rely on.", "From gated estates to apartment communities, Casa Nirvana is designed to connect residents, security operations and facility teams through one controlled community context."],
      ["Over 10,000 active users across multiple estates", "Visitor, resident and facility workflows in one platform"],
      ["Partnerships with leading maintenance and security firms", "Role-specific experiences for residents, guards and managers"],
      ["Backed by ISO‑certified data protection and GDPR compliance", "Community-scoped access and accountable activity records"],
      ["all-in-one payments solution", "configured service experience"],
      ["Payments made simple and personal.", "Supported services with clear status."],
      ["Your community fees, utilities, marketplace orders and insurance premiums can all be managed from the Casa Nirvana Personal Hub. Securely store funds, view every transaction, and get digital receipts — all while enjoying instant airtime and data top‑ups. Because convenience and transparency should be non‑negotiable.", "The Casa Nirvana Personal Hub exposes only the payment and digital-service categories available through the configured live catalog. Marketplace orders and supported transactions retain clear status without implying unavailable services."],
      ["Security you can trust", "Security grounded in scoped access"],
      ["Your safety and privacy are our utmost priorities.", "Access is designed around authenticated roles, community scope and accountable workflows."],
      ["ISO 27001 & ISO 27701 certified", "Role-aware access controls"],
      ["Our platform is certified under ISO 27001 and ISO 27701, ensuring that our information security and privacy management practices meet globally recognized standards.", "Residents, guards and administrators receive access according to their authenticated role and authorized community context."],
      ["GDPR & Local Data Protection Compliant", "Tenant and community data boundaries"],
      ["We comply fully with GDPR and local data protection laws, safeguarding user data with transparent policies and strict consent controls across all regions we serve.", "Community-scoped database policies and application checks are used to separate authorized operational data. Final legal and privacy wording remains subject to approval."],
      ["Real‑Time Threat Detection & Monitoring", "Operational monitoring and alerts"],
      ["We monitor our infrastructure in real time, using automated alerts to identify and mitigate potential risks before they impact your community.", "The platform includes operational health and observability surfaces, while community alerts remain scoped to authorized participants."],
      ["SOC 2 Compliant Infrastructure", "Accountable operational records"],
      ["Our infrastructure meets SOC 2 compliance, which ensures that our systems are designed for security, availability and confidentiality.", "Visitor, request, payment and communication workflows preserve status and ownership needed for accountable operations."],
      ["user feedback", "product principles"],
      ["Hear from our satisfied customers", "What Casa Nirvana is designed to improve"],
      ["“ Working with Silver feels like a partnership; as we continued to use their tool and found more use cases. ”", "Connected workflows reduce the gaps created by paper logs, scattered chats and separate operational tools."],
      ["8.5% ROI growth", "Clearer workflows"],
      ["Automatically jump into a dedicated Slack channel & we’ll provide", "Give each authorized role a focused path to the information and actions it needs."],
      ["45% Boosting", "Shared context"],
      ["No more paper checklists to even get started yet.", "Replace fragmented records with visible status and ownership."],
      ["Miranda H. Halim", "Casa Nirvana"],
      ["Head of idea", "Product principles"],
      ["Join Casa Nirvana today.", "Explore a Casa Nirvana rollout."],
      ["Transparent Fees", "Scoped rollout"],
      ["Fair and flexible pricing — the more you use Casa Nirvana, the less you pay.", "Pricing is scoped with each community after its operational and onboarding needs are understood."],
      ["Instant Responses", "Visible progress"],
      ["Get things done the moment they happen&#8230; Just like the speed of light.", "Follow visitor events, requests and updates through clear operational status."],
      ["The end-to-end payment platform built for growth.", "The connected operations platform built for community life."],
      ["Our team", "About us"],
      ["refund policy", "privacy policy"],
      ["Documentation", "Product overview"],
      ["Getting started", "Plan your rollout"],
      ["Components", "Core features"],
      ["API", "Contact"],
      ["Templates", "Products"],
      ["Public Roadmap", "FAQs"],
      ["Saliver", "Casa Nirvana"],
      ["2025 © All rights reserved by", "2026 © All rights reserved by"],
      ["Bravis-Themes", "Casa Nirvana"],
      ["/shop/", "/our-products/"],
    ],
  },
  "/our-products/": {
    replacements: [
      ["Start for free", "Plan your rollout"],
      ["Communities powered by Casa Nirvana", "Connected capabilities across Casa Nirvana"],
      ["10K+ Residents", "Resident experience"],
      ["Complaints, Maintenace, & Bookings Monthly", "Complaints, maintenance and amenity bookings"],
      ["3.7K+ Processed", "Structured"],
      ["Service & Incident Responses", "Service and incident responses"],
      ["30% Faster", "Visible"],
      ["Overall Satisfaction Rating", "Operational status and ownership"],
      ["$1.7K campaign", "Community operations"],
      ["Turning Insight into Impact with Agile Strategy", "Resident tools for everyday community life"],
      ["Launching a business can be thrilling, but important...", "Visitor passes, notices, requests, amenities and configured services stay connected."],
      ["Innovative Platforms for Meaningful Interactions", "Gate verification and structured entry workflows"],
      ["Building Trust with Consistent Brand Messaging", "Community administration with clearer oversight"],
      ["Empowering Retail with Scalable E-commerce Solutions", "Marketplace discovery, orders and status tracking"],
      ["From Concept to Click: A Journey in UI/UX", "Communication across authorized community roles"],
      ["Accelerating Engagement Through Smart Content", "Account controls and operational transparency"],
      ["view all reviews", "explore all products"],
      ["get started today", "plan your rollout"],
      ["Marketplace & Personal Hub", "Marketplace & supported services"],
      ["We offer flexible subscription plans based on the number of units and the features you need. There are no hidden fees, and communities can upgrade or downgrade as their needs change.", "Pricing is contact-led and scoped around community size, enabled modules, onboarding and support requirements. Commercial terms are confirmed before rollout."],
      ["Most property management tools focus on a single aspect of community life. Casa Nirvana connects the entire ecosystem — residents, guards, facility managers and vendors — with real‑time communication, automation and a built‑in marketplace.", "Casa Nirvana connects resident, guard, facility-management and marketplace workflows through a shared community context instead of separate operational records."],
      ["Administrators can set up billing cycles and automate invoices. Residents receive digital invoices and can pay via wallet or preferred payment methods; receipts are generated automatically.", "Authorized administrators manage supported community payment workflows, while residents use only the payment methods enabled by live policy and configured hosted checkout."],
      ["Casa Nirvana integrates with payment gateways, telecom providers, insurance services and local vendors. We also offer APIs for custom integration with existing systems.", "Casa Nirvana uses configured backend integrations for supported payment and digital-service categories. Availability depends on the live provider catalog and community settings."],
      ["Visitor management, amenity booking, maintenance requests, real‑time alerts, wallet and marketplace, analytics and more. Our platform is modular, so communities can select the features they need.", "Visitor management, amenity booking, maintenance requests, in-app updates, marketplace operations and role-aware administration are organized as configurable community modules."],
      ["We track response times, maintenance resolution, payment success rates, amenity utilisation, and more. These insights help communities improve efficiency and resident satisfaction.", "The platform records operational status across visitor, request, booking, payment and order workflows so authorized teams can follow activity and outcomes."],
      ["Communities can configure features, branding and user permissions. Our team works with you to tailor Casa Nirvana to your specific needs and preferences.", "Communities can configure supported modules and role-aware access. Rollout requirements are agreed with each organization before launch."],
      ["Reason 1", "Product demo"],
      ["Reason 2", "Community onboarding"],
      ["Reason 3", "Partnership enquiry"],
      ["sent message", "send message"],
      ["info@saliver.com", "hello@casanirvana.com"],
      ["+(123) 456 789 00", "Email enquiries"],
      ["Saliver Creative", "Casa Nirvana"],
      ["123 Coly new road, Horwich", "Accra"],
      ["Bolton, BL7 9QN", "Ghana"],
      ["The end-to-end payment platform built for growth.", "The connected operations platform built for community life."],
      ["Our team", "About us"],
      ["refund policy", "privacy policy"],
      ["Documentation", "Product overview"],
      ["Getting started", "Plan your rollout"],
      ["Components", "Core features"],
      ["API", "Contact"],
      ["Templates", "Products"],
      ["Public Roadmap", "FAQs"],
      ["Saliver", "Casa Nirvana"],
      ["2025 © All rights reserved by", "2026 © All rights reserved by"],
      ["Bravis-Themes", "Casa Nirvana"],
      ["/portfolio/turning-insight-into-impact-with-agile-strategy/", "/residents/"],
      ["/portfolio/innovative-platforms-for-meaningful-interactions/", "/security-guards/"],
      ["/portfolio/building-trust-with-consistent-brand-messaging/", "/facility-managers/"],
      ["/portfolio/empowering-retail-with-scalable-e-commerce-solutions/", "/marketplace/"],
      ["/portfolio/from-concept-to-click-a-journey-in-ui-ux/", "/core-features/"],
      ["/portfolio/accelerating-engagement-through-smart-content/", "/about-us/"],
      ["/shop/", "/our-products/"],
    ],
  },
  "/residents/": {
    replacements: [
      ["Start for free", "Plan your rollout"],
      ["All of your community\n\ttools in one\n\tpowerful app.", "Everyday community tools in one focused resident experience."],
      ["Interactions this month", "Connected resident workflows"],
      ["One mobile app features ensure cross-platform compatibility.", "A role-focused mobile experience keeps authorized community activity within reach."],
      ["Community satisfaction", "Clear community status"],
      ["Integration capabilities include RESTful APIs, webhooks, CRM and ERP integrations, and no-code automation through Zapier. Performance and scalability", "Visitor activity, notices, requests, bookings and configured services share one community context."],
      ["See Community Insights", "Explore resident features"],
      ["SaaS applications also provide a frictionless user experience with responsive UI/UX, dynamic dashboards, and personalized notifications.", "Residents receive focused navigation, in-app notifications and realtime updates for authorized community workflows."],
      ["E-commerce & monetization", "Everyday community access"],
      ["AI-based customer\n\tservice platform built for\n\tcollaboration.", "A connected resident experience built for everyday community life."],
      ["Stay ahead with real‑time community insights.", "Stay informed through community-scoped updates."],
      ["pricing plan", "plan your rollout"],
      ["Pre‑register guests, generate QR codes and get arrival notifications.", "Pre-register guests, generate QR or entry-code passes, and follow visitor status through the gate workflow."],
      ["Book gyms, pools or halls. View schedules and track your bookings.", "Discover configured amenities, view availability and track your community booking requests."],
      ["Book household services like cleaning, repairs and deliveries within your community.", "Submit supported service requests and follow their progress within your community."],
      ["Intelligent Insights", "Visible status"],
      ["Auto spin up incident Slack\n\tchannels, Zoom, Jira tickets", "Follow requests, visitor events and community updates through clear operational status."],
      ["Bill & Utility Payments", "Supported payments and services"],
      ["Recharge airtime or data, pay for water, electricity or insurance, and shop curated products from our in‑app marketplace — all within your personal hub.", "Access only the airtime, data, bill and marketplace categories enabled through the configured live catalog and payment policy."],
      ["Log complaints, assign them to the right team, and track maintenance tickets through to resolution. Receive real‑time status updates and keep everyone accountable.", "Submit complaints and maintenance requests, attach relevant details, and follow progress through visible status updates."],
      ["Community Insights", "Community information"],
      ["Gain intelligent insights into, payment collections, amenity usage and resident feedback — all displayed in interactive dashboards to guide better community decisions.", "Access notices, community information, directory details and the operational history available to your authorized resident profile."],
      ["Events & Notices", "Notices and announcements"],
      ["Never miss an update — receive notices, announcements and rule changes instantly. RSVP to community events, participate in polls and connect with neighbors right from the app.", "Receive community notices and announcements, save or share relevant updates, and connect with authorized community members through the directory and messaging flows."],
      ["ready to to integrate", "connected by design"],
      ["Saliver saas &\n\tsoftware built for\n\tcollaboration", "Casa Nirvana resident tools built for connected community life"],
      ["Automation & workflow features include a drag & drop builder, automated task assignments, conditional with good triggers, and api integrations.", "Visitor, request, notice, booking and marketplace workflows remain connected to the resident's authorized community context."],
      ["Code-wise syncing", "Community-scoped records"],
      ["Easy deployments", "Focused mobile workflows"],
      ["Easy to organize & setup", "Clear status and ownership"],
      ["API Playground", "Personal Hub"],
      ["Conditional with good triggers, and api integrations.", "Supported services follow live catalog and payment-policy availability."],
      ["Visitor authentication", "Visitor pass verification"],
      ["Keep docs & code in perfect harmony tailor thing.", "Share pass details that guards can resolve through QR or entry code."],
      ["12000", "One"],
      ["Happy users", "connected resident experience"],
      ["Like\n\thaving your most experienced\n\tthing", "Community life with less operational friction"],
      ["A platform you can trust to delight", "A focused experience for authorized residents"],
      ["Search smarter, faster, with precision.", "Find notices, marketplace items and community members through purpose-built search."],
      ["A service you can always trust.", "Keep visitor, request and booking activity easier to follow."],
      ["14-day trial, no credit card required.", "Plan a guided rollout around your community's needs."],
      ["Try It Out", "Explore Casa Nirvana"],
      ["Quality and trust in one place.", "Visitor and community workflows in one place."],
      ["Experience joy with every click.", "Use focused tools for everyday resident actions."],
      ["Delivering happiness you can trust.", "Keep important activity visible and accountable."],
      ["about platform", "about the resident experience"],
      ["Easily with a personalized product tour.", "See how the resident workflows fit your community."],
      ["Automation & workflow features include a drag & drop builder, automated task assignments, conditional with good triggers, and api integrations will be ready.", "Casa Nirvana connects the implemented resident workflows without relying on paper logs or disconnected group chats."],
      ["Marketing and engagement features", "Notices and communication"],
      ["SaaS and app solutions offer a comprehensive range", "Role-aware tools cover everyday community needs"],
      ["Management ensures secure", "Community scope supports controlled access"],
      ["Scan QR & download", "Explore the mobile experience"],
      ["Execute\n\tyour revenue strategy with\n\tprecision.", "Manage everyday community life with clearer status and less friction."],
      ["The documentation you want, available today!", "The resident tools your community enables, available in one experience."],
      ["The end-to-end payment platform built for growth.", "The connected operations platform built for community life."],
      ["Our team", "About us"],
      ["refund policy", "privacy policy"],
      ["Documentation", "Product overview"],
      ["Getting started", "Plan your rollout"],
      ["Components", "Core features"],
      ["API", "Contact"],
      ["Templates", "Products"],
      ["Public Roadmap", "FAQs"],
      ["Saliver", "Casa Nirvana"],
      ["2025 © All rights reserved by", "2026 © All rights reserved by"],
      ["Bravis-Themes", "Casa Nirvana"],
      ["/shop/", "/our-products/"],
    ],
  },
  "/security-guards/": {
    replacements: [
      ["Start for free", "Plan your rollout"],
      ["Build your pixel-perfect app", "Confidence at every entry point"],
      ["One central hub for\n\tyour assets\n\tand team", "One focused guard experience for gate and incident operations"],
      ["E-commerce & monetization", "Structured gate operations"],
      ["One mobile app features ensure cross-platform compatibility.", "A role-focused mobile experience keeps guards connected to their assigned community workflows."],
      ["IoT and smart features", "QR and entry-code verification"],
      ["Integration capabilities include RESTful APIs, webhooks, CRM and ERP integrations, and no-code automation through Zapier. Performance and scalability", "Resolve actionable visitor passes against community-scoped records without relying on paper gate logs."],
      ["Accessibility and usability", "Clear operational decisions"],
      ["SaaS applications also provide a frictionless user experience with responsive UI/UX, dynamic dashboards, and personalized notifications.", "Loading, error and status-aware screens help guards act on live visitor, notification and incident records."],
      ["AI-based customer\n\tservice platform built for\n\tcollaboration.", "Gate, communication and emergency workflows built for accountable security operations."],
      ["Adapt our platform to suit your unique business", "Configure guard modules around each community's operations"],
      ["pricing plan", "plan your rollout"],
      ["Smart Automation", "Visitor verification"],
      ["The only multi-cloud on-call\n\tsolutions, period", "Scan QR codes or enter pass codes to resolve actionable visitor records."],
      ["Intelligent Insights", "Entry status"],
      ["All in one kind of alerts from one place", "See checked-in and checked-out activity with community-scoped counts."],
      ["Secure authentication with multi factor verification", "Authenticated guard access with community and assignment scope"],
      ["Auto spin up incident Slack\n\tchannels, Zoom, Jira tickets", "Acknowledge, investigate, resolve and escalate community emergency alerts."],
      ["API Playground", "Resident directory"],
      ["Automatically jump into a dedicated Slack channel and we’ll provide all relevant tools and responders in one place.", "Find authorized community members and start the appropriate in-app message, resident call or direct visitor contact flow."],
      ["Customizable Dashboards", "Role-aware module controls"],
      ["ready to to integrate", "connected by design"],
      ["Saliver saas &\n\tsoftware built for\n\tcollaboration", "Casa Nirvana guard tools built for gate and incident coordination"],
      ["Automation & workflow features include a drag & drop builder, automated task assignments, conditional with good triggers, and api integrations.", "Visitor entry, in/out, emergency, communication and directory features remain scoped to the guard's authenticated community."],
      ["Code-wise syncing", "Community-scoped records"],
      ["Easy deployments", "Focused mobile workflows"],
      ["Easy to organize & setup", "Clear status and ownership"],
      ["Conditional with good triggers, and api integrations.", "Module settings control which supported guard capabilities are available."],
      ["Visitor authentication", "Visitor pass verification"],
      ["Keep docs & code in perfect harmony tailor thing.", "Validate resident-created passes and structured walk-in entries through one gate workflow."],
      ["12000", "One"],
      ["Happy users", "accountable guard workflow"],
      ["Like\n\thaving your most experienced\n\tthing", "The right operational context when guards need it"],
      ["A platform you can trust to delight", "A focused experience for authorized guards"],
      ["Search smarter, faster, with precision.", "Search the enabled resident directory without exposing unrelated communities."],
      ["A service you can always trust.", "Keep visitor and incident activity easier to follow."],
      ["14-day trial, no credit card required.", "Plan a guided rollout around your community's needs."],
      ["Try It Out", "Explore Casa Nirvana"],
      ["Quality and trust in one place.", "Gate and incident workflows in one place."],
      ["Experience joy with every click.", "Use focused tools for time-sensitive guard actions."],
      ["Delivering happiness you can trust.", "Keep important activity visible and accountable."],
      ["about platform", "about the guard experience"],
      ["Easily with a personalized product tour.", "See how guard workflows fit your community."],
      ["Automation & workflow features include a drag & drop builder, automated task assignments, conditional with good triggers, and api integrations will be ready.", "Casa Nirvana connects implemented gate, directory, communication and emergency workflows without unsupported automation claims."],
      ["Marketing and engagement features", "Notifications and communication"],
      ["SaaS and app solutions offer a comprehensive range", "Role-aware tools support daily guard operations"],
      ["Management ensures secure", "Community scope supports controlled access"],
      ["Scan QR & download", "Explore the mobile experience"],
      ["Execute\n\tyour revenue strategy with\n\tprecision.", "Handle gate activity and incident coordination with clearer operational context."],
      ["The documentation you want, available today!", "The guard tools your community enables, available in one focused experience."],
      ["The end-to-end payment platform built for growth.", "The connected operations platform built for community life."],
      ["Our team", "About us"],
      ["refund policy", "privacy policy"],
      ["Documentation", "Product overview"],
      ["Getting started", "Plan your rollout"],
      ["Components", "Core features"],
      ["API", "Contact"],
      ["Templates", "Products"],
      ["Public Roadmap", "FAQs"],
      ["Saliver", "Casa Nirvana"],
      ["2025 © All rights reserved by", "2026 © All rights reserved by"],
      ["Bravis-Themes", "Casa Nirvana"],
      ["/shop/", "/our-products/"],
    ],
  },
  "/facility-managers/": {
    replacements: [
      ["Start for free", "Plan your rollout"],
      ["launch your ai website with in a days", "Bring community operations into one accountable workspace"],
      ["Effortless email & marketing automation", "Clearer facility and community coordination"],
      ["Grow your business with AI-powered automations that suggest, personalize, and validate your marketing campaigns.", "Manage communities, units, residents, guards, visitors, requests, notices and amenities through connected operational records."],
      ["Start 30-day free trail", "Discuss your community rollout"],
      ["No-require Credit Card", "Scope the modules you need"],
      ["Cancel Anytime", "Confirm onboarding requirements"],
      ["get started today", "plan your rollout"],
      ["Free Forever. No Credit Card.", "Contact-led pricing based on approved rollout scope."],
      ["Build your pixel-perfect app", "Operations without blind spots"],
      ["One central hub for\n\tyour assets\n\tand team", "One administrative workspace for communities, people and daily operations"],
      ["E-commerce & monetization", "Community and unit administration"],
      ["One mobile app features ensure cross-platform compatibility.", "Maintain community, unit, resident, guard and membership records through authorized administrative workflows."],
      ["IoT and smart features", "Visitor and guard oversight"],
      ["Integration capabilities include RESTful APIs, webhooks, CRM and ERP integrations, and no-code automation through Zapier. Performance and scalability", "Review visitor activity, guard assignments and enabled operational modules within the appropriate community scope."],
      ["Accessibility and usability", "Requests and amenities"],
      ["SaaS applications also provide a frictionless user experience with responsive UI/UX, dynamic dashboards, and personalized notifications.", "Follow complaints, maintenance, service requests, join requests and amenity bookings through clear administrative states."],
      ["AI-based customer\n\tservice platform built for\n\tcollaboration.", "A connected management workspace built around real residential-community operations."],
      ["Adapt our platform to suit your unique business", "Configure Casa Nirvana around your community's enabled modules"],
      ["pricing plan", "contact-led pricing"],
      ["Smart Automation", "Community control"],
      ["The only multi-cloud on-call\n\tsolutions, period", "Manage authorized community, unit, resident and guard records in one place."],
      ["Intelligent Insights", "Operational visibility"],
      ["All in one kind of alerts from one place", "Review the status and ownership of visitor, request, booking and payment activity."],
      ["Secure authentication with multi factor verification", "Authenticated administrative access with role and community scope"],
      ["Auto spin up incident Slack\n\tchannels, Zoom, Jira tickets", "Coordinate notices, requests and emergency escalation through Casa Nirvana workflows."],
      ["API Playground", "Module settings"],
      ["Automatically jump into a dedicated Slack channel and we’ll provide all relevant tools and responders in one place.", "Control which supported resident and guard modules are available for each configured community."],
      ["Customizable Dashboards", "Focused administrative workspaces"],
      ["ready to to integrate", "connected by design"],
      ["Saliver saas &\n\tsoftware built for\n\tcollaboration", "Casa Nirvana management tools built for accountable community operations"],
      ["Automation & workflow features include a drag & drop builder, automated task assignments, conditional with good triggers, and api integrations.", "Resident, guard, visitor, request, amenity and communication records remain connected to their authorized community context."],
      ["Code-wise syncing", "Community-scoped records"],
      ["Easy deployments", "Guided onboarding"],
      ["Easy to organize & setup", "Role-aware administration"],
      ["Conditional with good triggers, and api integrations.", "Supported modules and payment methods follow configured live policy."],
      ["Visitor authentication", "Visitor operations"],
      ["Keep docs & code in perfect harmony tailor thing.", "Review resident-created passes and structured gate activity through connected records."],
      ["12000", "One"],
      ["Happy users", "connected operations workspace"],
      ["Like\n\thaving your most experienced\n\tthing", "The operational context facility teams need"],
      ["A platform you can trust to delight", "A focused workspace for authorized managers"],
      ["Search smarter, faster, with precision.", "Find the relevant community, resident, guard, request or visitor record."],
      ["A service you can always trust.", "Keep important activity visible and easier to coordinate."],
      ["14-day trial, no credit card required.", "Plan a guided rollout around your community's operational needs."],
      ["Try It Out", "Explore Casa Nirvana"],
      ["Quality and trust in one place.", "Community operations in one controlled workspace."],
      ["Experience joy with every click.", "Use focused workspaces for daily management tasks."],
      ["Delivering happiness you can trust.", "Keep status, ownership and community scope visible."],
      ["about platform", "about the management workspace"],
      ["Easily with a personalized product tour.", "See how the management workflows fit your organization."],
      ["Automation & workflow features include a drag & drop builder, automated task assignments, conditional with good triggers, and api integrations will be ready.", "Casa Nirvana connects implemented administrative workflows without unsupported AI or no-code automation promises."],
      ["Marketing and engagement features", "Notices and community communication"],
      ["SaaS and app solutions offer a comprehensive range", "Role-aware tools cover core community operations"],
      ["Management ensures secure", "Community scope supports controlled access"],
      ["Scan QR & download", "Explore the management experience"],
      ["Execute\n\tyour revenue strategy with\n\tprecision.", "Coordinate community operations with clearer status and accountability."],
      ["The documentation you want, available today!", "The management tools your organization enables, available in one workspace."],
      ["The end-to-end payment platform built for growth.", "The connected operations platform built for community life."],
      ["Our team", "About us"],
      ["refund policy", "privacy policy"],
      ["Documentation", "Product overview"],
      ["Getting started", "Plan your rollout"],
      ["Components", "Core features"],
      ["API", "Contact"],
      ["Templates", "Products"],
      ["Public Roadmap", "FAQs"],
      ["Saliver", "Casa Nirvana"],
      ["2025 © All rights reserved by", "2026 © All rights reserved by"],
      ["Bravis-Themes", "Casa Nirvana"],
      ["/shop/", "/our-products/"],
    ],
  },
  "/marketplace/": {
    sequentialReplacements: [
      ["Intelligent Insights", ["Cart and fulfilment", "Authenticated access", "Order visibility"]],
      ["API Playground", ["Marketplace administration", "Order oversight"]],
      ["Customizable Dashboards", ["Catalog configuration", "Marketplace policies"]],
      ["Automatically jump into a dedicated Slack channel and we’ll provide all relevant tools and responders in one place.", [
        "Authorized administrators manage marketplace categories, listings, vendors, orders and review visibility through scoped workflows.",
        "Manage configured categories, product listings, vendor records and visibility through authorized workflows.",
        "Review recorded orders, payment status and fulfilment information within the permitted community scope.",
        "Keep availability, fulfilment and payment options aligned with configured marketplace data and community policy.",
      ]],
    ],
    replacements: [
      ["Start for free", "Plan your rollout"],
      ["Build your pixel-perfect app", "Trusted discovery within the community experience"],
      ["One central hub for\n\tyour assets\n\tand team", "Products, services, cart and orders in one resident marketplace"],
      ["E-commerce & monetization", "Marketplace discovery"],
      ["One mobile app features ensure cross-platform compatibility.", "Residents can browse configured categories and products through a focused marketplace experience."],
      ["IoT and smart features", "Search and product details"],
      ["Integration capabilities include RESTful APIs, webhooks, CRM and ERP integrations, and no-code automation through Zapier. Performance and scalability", "Search configured listings, review product information and use persisted recent-search history without unrelated integration claims."],
      ["Accessibility and usability", "Cart and delivery choices"],
      ["SaaS applications also provide a frictionless user experience with responsive UI/UX, dynamic dashboards, and personalized notifications.", "Manage cart quantities, choose delivery or pickup where configured, and save delivery addresses for supported orders."],
      ["AI-based customer\n\tservice platform built for\n\tcollaboration.", "A community marketplace connected to resident and administrative workflows."],
      ["Adapt our platform to suit your unique business", "Shape marketplace availability around configured community data"],
      ["pricing plan", "plan your rollout"],
      ["Smart Automation", "Product discovery"],
      ["The only multi-cloud on-call\n\tsolutions, period", "Browse categories, search listings and review configured product details."],
      ["All in one kind of alerts from one place", "Place supported orders and follow their recorded status through the resident experience."],
      ["Secure authentication with multi factor verification", "Authenticated resident access with community and account scope"],
      ["Auto spin up incident Slack\n\tchannels, Zoom, Jira tickets", "Keep cart, address, order and tracking activity connected to the authenticated resident."],
      ["Google", "Product listings"],
      ["London", "Categories"],
      ["Bing", "Search"],
      ["Dhaka", "Cart"],
      ["Opera", "Delivery"],
      ["Japan", "Pickup"],
      ["Woocommerce", "Orders"],
      ["New York", "Order status"],
      ["Shopify", "Addresses"],
      ["Hanoi", "Fulfilment"],
      ["ready to to integrate", "connected by design"],
      ["Saliver saas &\n\tsoftware built for\n\tcollaboration", "Casa Nirvana marketplace tools built for community-specific discovery"],
      ["Automation & workflow features include a drag & drop builder, automated task assignments, conditional with good triggers, and api integrations.", "Marketplace products, carts, addresses and orders remain connected to authenticated resident and administrative records."],
      ["Code-wise syncing", "Persisted marketplace records"],
      ["Easy deployments", "Focused resident shopping"],
      ["Easy to organize & setup", "Scoped marketplace administration"],
      ["Conditional with good triggers, and api integrations.", "Inventory, vendors, payment methods and fulfilment depend on configured marketplace data and policy."],
      ["Visitor authentication", "Authenticated marketplace access"],
      ["Keep docs & code in perfect harmony tailor thing.", "Keep cart and order activity associated with the correct resident account."],
      ["12000", "One"],
      ["Happy users", "connected marketplace experience"],
      ["Like\n\thaving your most experienced\n\tthing", "Community-relevant products and services within reach"],
      ["A platform you can trust to delight", "A focused marketplace for authorized residents"],
      ["Search smarter, faster, with precision.", "Search configured products and categories with persisted recent history."],
      ["A service you can always trust.", "Follow cart and order status through connected records."],
      ["14-day trial, no credit card required.", "Plan a guided rollout around your community's marketplace needs."],
      ["Try It Out", "Explore Casa Nirvana"],
      ["Quality and trust in one place.", "Discovery, cart and orders in one experience."],
      ["Experience joy with every click.", "Use focused flows for product discovery and checkout."],
      ["Delivering happiness you can trust.", "Keep availability and order status truthful."],
      ["about platform", "about the marketplace"],
      ["Easily with a personalized product tour.", "See how marketplace workflows fit your community."],
      ["Automation & workflow features include a drag & drop builder, automated task assignments, conditional with good triggers, and api integrations will be ready.", "Casa Nirvana connects implemented marketplace workflows without unsupported automation or fulfilment promises."],
      ["Marketing and engagement features", "Categories and product discovery"],
      ["SaaS and app solutions offer a comprehensive range", "Resident tools cover cart, addresses and orders"],
      ["Management ensures secure", "Authenticated scope supports controlled marketplace access"],
      ["Scan QR & download", "Explore the resident marketplace"],
      ["Execute\n\tyour revenue strategy with\n\tprecision.", "Bring configured community marketplace activity into one resident experience."],
      ["The documentation you want, available today!", "The marketplace tools your community enables, available through Casa Nirvana."],
      ["The end-to-end payment platform built for growth.", "The connected operations platform built for community life."],
      ["Our team", "About us"],
      ["refund policy", "privacy policy"],
      ["Documentation", "Product overview"],
      ["Getting started", "Plan your rollout"],
      ["Components", "Core features"],
      ["API", "Contact"],
      ["Templates", "Products"],
      ["Public Roadmap", "FAQs"],
      ["Saliver", "Casa Nirvana"],
      ["2025 © All rights reserved by", "2026 © All rights reserved by"],
      ["Bravis-Themes", "Casa Nirvana"],
      ["/shop/", "/our-products/"],
    ],
  },
  "/pricing-plans/": {
    sequentialReplacements: [
      ["For personal use &amp; explanation of AI technology thing.", [
        "A focused starting scope for core resident, visitor and guard operations in one community.",
        "An expanded operating scope shaped by enabled modules, onboarding and agreed support.",
        "A multi-community rollout with portfolio governance, staged onboarding and agreed service coverage.",
        "A focused starting scope for core resident, visitor and guard operations in one community.",
        "An expanded operating scope shaped by enabled modules, onboarding and agreed support.",
        "A multi-community rollout with portfolio governance, staged onboarding and agreed service coverage.",
      ]],
    ],
    replacements: [
      ["Start for free", "Plan your rollout"],
      ["pricing & plans", "rollout scope"],
      ["Evolving powerful concepts into tangible & relatable", "Pricing shaped around your community and operating requirements"],
      ["monthly", "community scope"],
      ["yearly (-10%)", "portfolio scope"],
      ["Basic plan", "Essential operations"],
      ["Free", "Contact-led"],
      ["try for free", "discuss your scope"],
      ["Task creation and management", "Resident and guard experiences"],
      ["Included money back guarantee", "Visitor lifecycle and gate records"],
      ["Competitive price comparison", "Notices, complaints and maintenance"],
      ["Premium service exclusive features", "Configured community modules"],
      ["Value highlighted clearly", "Guided onboarding requirements"],
      ["Upgrade path expanded", "Documented rollout boundaries"],
      ["Advance plan", "Complete operations"],
      ["Enterprise plan", "Portfolio operations"],
      ["549.99", "By agreement"],
      ["399.99", "Scoped quote"],
      ["149.99", "By agreement"],
      ["49.99", "Scoped quote"],
      ["compare with others", "compare rollout scopes"],
      ["Compare Saliver with other competitors", "Compare Casa Nirvana operational scopes"],
      ["Wix Theme", "Essential"],
      ["Framer", "Operations"],
      ["Saliver", "Portfolio"],
      ["Price", "Commercial terms"],
      ["$29/month", "Contact-led"],
      ["$56/month", "Scoped quote"],
      ["Custom", "By agreement"],
      ["$", ""],
      ["User Accounts", "Community coverage"],
      ["Up to 5 users", "Single-community scope"],
      ["Up to 20 users", "Expanded module scope"],
      ["Unlimited", "Multi-community scope"],
      ["Automated Invoicing", "Resident and visitor operations"],
      ["Expense Tracking", "Guard and entry operations"],
      ["Basic Financial Reporting", "Requests, notices and amenities"],
      ["Advanced Financial Analytics", "Supported payment visibility"],
      ["AI-Powered Financial Forecasting", "Marketplace and Personal Hub options"],
      ["Workflow Automation", "Community module controls"],
      ["Third-Party Software Integration", "Configured provider integrations"],
      ["Custom Integrations", "Onboarding and migration"],
      ["Project & Task Management", "Guided onboarding"],
      ["Business Analytics & Insights", "Staged rollout"],
      ["Real-Time AI Insights", "Portfolio rollout plan"],
      ["Support", "Support model"],
      ["Email", "Agreed channel"],
      ["Phone", "Agreed coverage"],
      ["Priority", "Agreed service level"],
      ["try it for free", "plan your rollout"],
      ["The end-to-end payment platform built for growth.", "The connected operations platform built for community life."],
      ["Our team", "About us"],
      ["refund policy", "privacy policy"],
      ["Documentation", "Product overview"],
      ["Getting started", "Plan your rollout"],
      ["Components", "Core features"],
      ["API", "Contact"],
      ["Templates", "Products"],
      ["Public Roadmap", "FAQs"],
      ["2025 © All rights reserved by", "2026 © All rights reserved by"],
      ["Bravis-Themes", "Casa Nirvana"],
      ["/shop/", "/our-products/"],
    ],
  },
  "/core-features/": {
    sequentialReplacements: [
      [
        "Automation & workflow features include a drag & drop builder, automated task assignments, conditional with good triggers, and api integrations.",
        [
          "Residents can review configured amenities, availability and booking status through community-scoped workflows.",
          "Create complaints or maintenance requests, attach supporting files and follow recorded status.",
          "Browse configured marketplace listings, manage a cart and follow supported order activity.",
          "View supported charges and provider-returned payment status under configured community policy.",
          "Casa Nirvana connects implemented workflows through explicit product states rather than unsupported AI or no-code automation claims.",
          "Rollout follows a controlled path from community setup and role assignment through configured services and production readiness.",
        ],
      ],
      [
        "Automation & workflow features include a drag & drop builder, automated task assignments, conditional with good triggers, and api integrations will be ready.",
        [
          "Residents, guards and managers join through verified membership and assigned roles.",
          "Operational records retain explicit states so authorized participants can follow progress without disconnected follow-ups.",
          "Shared community scope keeps resident, guard and facility activity aligned without exposing unrelated records.",
        ],
      ],
      [
        "“ Working with Silver feels like a partnership; as we continued to use their tool and found more use cases. ”",
        [
          "Resident tools keep visitor activity, service requests, bookings and community updates within an authorized community context.",
          "Guard operations support checkpoint work, visitor verification and incident records with clear operational status.",
          "Facility oversight connects configured services, resident activity and operational records for accountable follow-through.",
        ],
      ],
      ["/CEO", ["/Resident experience", "/Guard operations", "/Facility oversight"]],
      [
        "Automatically jump into a dedicated Slack channel and we’ll provide.",
        [
          "Define community records, enabled modules and the operational scope for rollout.",
          "Onboard residents, guards and facility teams with the appropriate roles.",
          "Verify enabled gateways, notifications and service workflows before launch.",
          "Move into production with documented ownership, support and follow-up checks.",
        ],
      ],
      [
        "What design principles will you follow?",
        [
          "What design principles guide Casa Nirvana?",
          "Can communities enable different modules?",
          "How is operational access controlled?",
        ],
      ],
    ],
    replacements: [
      ["Start for free", "Plan your rollout"],
      ["CX platform gives your team superpowers", "Connected workflows for modern community operations"],
      ["AI-based\n\tcustomer service platform built for\n\tcollaboration.", "Resident, guard and facility tools built around one authorized community context."],
      ["14-day trial,\n\tno credit card required.", "A guided rollout shaped around your community."],
      ["AI-based customer\n\tservice platform built for", "Connected community operations built for"],
      ["Calendar", "Amenities"],
      ["Analytics", "Requests"],
      ["Invoices", "Payments"],
      ["built with calendar", "built around community workflows"],
      ["SaaS & app\n\tsolutions offer a comprehensive", "Community operations connected through role-aware product experiences"],
      ["Collaboration tools enable in-app messaging, file sharing, task tracking, and video conferencing.", "Community-scoped messaging, attachments, call records, notices and notifications help authorized participants coordinate."],
      ["real-time analytics", "realtime in-app updates"],
      ["Integration\n\tcapabilities include RESTful APIs", "Configured integrations remain behind backend controls"],
      ["Mobile app features ensure cross-platform compatibility, push notifications, offline mode", "Resident and guard apps provide focused mobile workflows; push delivery and offline guarantees are not part of the current launch claim"],
      ["easy to customize products", "configurable community modules"],
      ["Customer support\n\ttools include AI-driven ticketing", "Complaints, maintenance and help-desk requests preserve status and ownership"],
      ["DevOps and CI/CD processes enable automated testing, version control, server monitoring, and error tracking", "Operational health and observability support the platform without becoming an unsupported customer-facing guarantee"],
      ["easy to sent invoice", "supported payment records"],
      ["Billing and ROI\n\tsubscription management", "Community payment and hosted checkout workflows"],
      ["IoT and smart features support real-time data streaming, remote device management, secure authentication", "Authenticated role and community scope control access to supported operational data"],
      ["Connect with tools that enhance your experience", "Connect the workflows that shape daily community life"],
      ["We believe global business should be just as easy and hassle-free as doing business locally and internationlly.", "Casa Nirvana reduces the gaps created by paper logs, scattered chats and separate community tools."],
      ["Input Data", "Configure the community"],
      ["Upload or connect your data sources seamlessly.", "Facility teams define the community, enabled modules and operating settings before launch."],
      ["Code-wise syncing", "Invite authorized members"],
      ["Easy deployments", "Use role-focused tools"],
      ["Deploy with just a few clicks. No complex setup required — automated from build to production, with CI/CD support and safe rollbacks.", "Each role sees the tasks, records and status relevant to its responsibilities."],
      ["AI Processing", "Operational action"],
      ["Our AI analyzes, predicts, and optimizes in real time.", "Authorized users create, review and progress records through explicit application workflows."],
      ["Core level process", "Visible lifecycle status"],
      ["Flow with trend", "Follow activity from creation to outcome"],
      ["Ship fast, ship often. One-click deploys, auto-builds, and zero-config CI/CD — because waiting is so last season.", "Visitor passes, maintenance requests, complaints, bookings and orders retain status appropriate to their lifecycle."],
      ["Actionable Insights", "Accountable history"],
      ["Get clear, data-driven recommendations instantly.", "Review the recorded status, ownership and community scope available to your authorized role."],
      ["Clear data", "Clear operational context"],
      ["Deploy your app in seconds with zero config, auto-builds, and built-in CI/CD — from dev to production, smooth and effortless.", "Keep residents, security teams and facility managers aligned through shared, scoped operational records."],
      ["See It in Action", "Explore the products"],
      ["Try It Out", "Plan your rollout"],
      ["Unique features that make a difference", "Connected capabilities for each community role"],
      ["Mateo R. Albright", "Casa Nirvana"],
      ["try it now", "explore Casa Nirvana"],
      ["12000", "One"],
      ["Happy users", "connected community context"],
      ["Upload or connect your data", "Configure your community"],
      ["Enter all details for setup", "Invite authorized teams and residents"],
      ["Pay bill for subscription", "Confirm configured payment policy"],
      ["Ready setup for store", "Launch connected operations"],
      ["+ 12%", "Clear"],
      ["Customer Satisfaction (CSAT): 4.7/5", "Operational status and ownership across supported workflows"],
      ["Our platform integrates with trusted payment gateways, telecom providers, utility companies and access control devices, giving your community everything it needs without switching between apps.", "Casa Nirvana connects configured payment, digital-service and access workflows, with availability controlled by live provider and community settings."],
      ["Automate collections and process transactions through integrated gateways.", "Manage supported charges and payment activity through configured hosted checkout workflows."],
      ["Recharge airtime and data; conveniently pay water and electricity bills directly.", "Access only the airtime, data and bill categories exposed by the configured live service catalog."],
      ["universal questions Hub", "common product questions"],
      ["Get answers\n\tto every single question.", "Answers about product scope, access and rollout."],
      ["What problem does your SaaS solve?", "What problem does Casa Nirvana solve?"],
      ["Our SaaS automates workflows, enhances efficiency, and simplifies complex tasks for businesses of all sizes effortlessly.", "Casa Nirvana replaces fragmented community logs, chats and tools with connected resident, guard and facility workflows."],
      ["What pricing model will you use?", "How is Casa Nirvana pricing determined?"],
      ["We offer subscription-based pricing, monthly or yearly, with a limited free plan for startups and small businesses.", "Pricing is contact-led and scoped around community size, enabled modules, onboarding and support requirements."],
      ["How is your SaaS different?", "How is Casa Nirvana different?"],
      ["Our SaaS stands out with AI-powered automation, deep customization options, and an intuitive, user-friendly interface design.", "Casa Nirvana connects resident, guard, facility-management and marketplace activity through one community-scoped platform."],
      ["Clean, intuitive, and user-centric design with consistency, accessibility, and seamless user experience across all devices.", "Role-focused interfaces prioritize clarity, accessible interaction and truthful operational states."],
      ["How will billing and subscriptions work?", "How do supported payments work?"],
      ["Automated recurring billing with flexible monthly or yearly plans, easy cancellations, and transparent pricing for users.", "Payment methods and service categories follow configured live policy, hosted checkout and provider-returned status."],
      ["Startups, small businesses, and enterprises needing automation, efficiency, and scalable digital solutions for daily operations.", "Residents, security guards, facility managers, authorized administrators and configured marketplace participants."],
      ["Payment gateways, CRM platforms, cloud storage, marketing tools, and project management software for seamless business workflows.", "Only configured backend payment and digital-service integrations are included in launch claims."],
      ["AI automation, real-time collaboration, analytics, integrations, role-based access, and a seamless user experience.", "Visitor operations, requests, amenities, notices, messaging, in-app updates, marketplace flows and role-aware administration."],
      ["User retention, engagement, churn rate, revenue growth, customer satisfaction, and feature adoption rates.", "Authorized teams can follow operational status across visitors, requests, bookings, payments and orders."],
      ["Custom dashboards, branding options, workflow automation, API access, and adjustable user roles for flexibility.", "Supported community modules and role-aware access can be configured during the agreed rollout."],
      ["Self-serve in minutes", "Guided community rollout"],
      ["Equity doesn't have to be complicated.", "A controlled rollout from configuration to launch."],
      ["try for free", "plan your rollout"],
      ["try free demo", "book a demo"],
      ["Execute\n\tyour revenue strategy with\n\tprecision.", "Plan your Casa Nirvana rollout with our team."],
      ["The end-to-end payment platform built for growth.", "The connected operations platform built for community life."],
      ["Our team", "About us"],
      ["refund policy", "privacy policy"],
      ["Documentation", "Product overview"],
      ["Getting started", "Plan your rollout"],
      ["Components", "Core features"],
      ["API", "Contact"],
      ["Templates", "Products"],
      ["Public Roadmap", "FAQs"],
      ["Saliver", "Casa Nirvana"],
      ["2025 © All rights reserved by", "2026 © All rights reserved by"],
      ["Bravis-Themes", "Casa Nirvana"],
      ["/shop/", "/our-products/"],
    ],
  },
  "/faqs/": {
    sequentialReplacements: [
      [
        "Automatically jump into a dedicated Slack channel and we’ll provide.",
        [
          "Pre-register visitors and give guards QR or entry-code verification workflows.",
          "Access visitor passes, requests, amenities, notices, messaging and community updates from one resident experience.",
          "Verify visitors, record incidents and follow checkpoint activity from the guard workflow.",
          "Connect resident, guard and facility workflows through shared community-scoped records.",
        ],
      ],
      [
        "From welcome series to abandoned carts, automate marketing campaigns to reach targets faster.",
        [
          "Manage community records, requests, amenities, notices and operational activity from one workspace.",
          "Browse configured products, manage a cart and follow supported order status within the community.",
        ],
      ],
    ],
    replacements: [
      ["Start for free", "Plan your rollout"],
      ["Digital Marketing", "Visitor Management"],
      ["Read More", "Explore feature"],
      ["Website Development", "Resident Experience"],
      ["Social Media Marketing", "Security Operations"],
      ["UI & UX Design", "Facility Management"],
      ["UI &#038; UX Design", "Facility Management"],
      ["Content Writing", "Marketplace"],
      ["Business Consultancy", "Community Operations"],
      ["https://saliver.bravisthemes.com/assets/uploads/2025/04/038-marketing.svg", "/assets/uploads/2025/04/038-marketing.svg"],
      ["https://saliver.bravisthemes.com/assets/uploads/2025/03/005-rating-stars.svg", "/assets/uploads/2025/03/005-rating-stars.svg"],
      ["https://saliver.bravisthemes.com/assets/uploads/2025/04/030-rocket-ship.svg", "/assets/uploads/2025/04/030-rocket-ship.svg"],
      ["https://saliver.bravisthemes.com/assets/uploads/2025/03/040-idea.svg", "/assets/uploads/2025/03/040-idea.svg"],
      ["https://saliver.bravisthemes.com/assets/uploads/2025/03/010-meta.svg", "/assets/uploads/2025/03/010-meta.svg"],
      ["https://saliver.bravisthemes.com/assets/uploads/2025/04/015-idea-1.svg", "/assets/uploads/2025/04/015-idea-1.svg"],
      ["universal question", "common questions"],
      ["Get every single answer", "Clear answers about Casa Nirvana"],
      ["General & Business Strategy", "Platform and rollout"],
      ["What problem does your SaaS solve?", "What problem does Casa Nirvana solve?"],
      ["Our SaaS automates workflows, enhances efficiency, and simplifies complex tasks for businesses of all sizes effortlessly.", "Casa Nirvana replaces fragmented gate logs, chats and community tools with connected workflows for residents, guards and facility teams."],
      ["What pricing model will you use?", "How is Casa Nirvana pricing determined?"],
      ["We offer subscription-based pricing, monthly or yearly, with a limited free plan for startups and small businesses.", "Pricing is contact-led and scoped around community size, enabled modules, onboarding and support requirements. Commercial terms are confirmed before rollout."],
      ["How is your SaaS different?", "How is Casa Nirvana different?"],
      ["Our SaaS stands out with AI-powered automation, deep customization options, and an intuitive, user-friendly interface design.", "Casa Nirvana connects resident, guard, facility-management and marketplace activity through one role-aware community context."],
      ["Design & User Experience (UX/UI)", "Access and experience"],
      ["Design &#038; User Experience (UX/UI)", "Access and experience"],
      ["What design principles will you follow?", "What design principles guide the applications?"],
      ["Clean, intuitive, and user-centric design with consistency, accessibility, and seamless user experience across all devices.", "Role-focused interfaces prioritize clarity, accessible interaction and truthful loading, success, unavailable and failure states."],
      ["How will billing and subscriptions work?", "How do supported payments work?"],
      ["Automated recurring billing with flexible monthly or yearly plans, easy cancellations, and transparent pricing for users.", "Available payment methods and digital-service categories follow configured live policy, hosted checkout and provider-returned settlement and fulfilment status."],
      ["Functionality & Features", "Users and capabilities"],
      ["Functionality &#038; Features", "Users and capabilities"],
      ["Who is your target audience?", "Who uses Casa Nirvana?"],
      ["Startups, small businesses, and enterprises needing automation, efficiency, and scalable digital solutions for daily operations.", "Residents, security guards, facility managers, authorized administrators and configured marketplace participants use role-specific experiences."],
      ["What third-party integrations are needed?", "Which integrations are available?"],
      ["Payment gateways, CRM platforms, cloud storage, marketing tools, and project management software for seamless business workflows.", "Available integrations are enabled by the backend and community configuration. Payment and digital-service availability depends on the live provider setup."],
      ["Performance & Security", "Operations and access"],
      ["Performance &#038; Security", "Operations and access"],
      ["What key features must be included?", "Which core features are supported?"],
      ["AI automation, real-time collaboration, analytics, integrations, role-based access, and a seamless user experience.", "Visitor operations, requests, amenities, notices, messaging, in-app updates, marketplace flows, emergency triage and role-aware administration."],
      ["What success metrics will you track?", "What operational activity can authorized teams follow?"],
      ["User retention, engagement, churn rate, revenue growth, customer satisfaction, and feature adoption rates.", "Authorized teams can follow recorded status across visitors, requests, bookings, payments and orders within their permitted community scope."],
      ["What customization options are available?", "What can a community configure?"],
      ["Custom dashboards, branding options, workflow automation, API access, and adjustable user roles for flexibility.", "Supported modules and role-aware access are configured during rollout. Additional integration or branding requirements require separate approval and scoping."],
      ["Hi, how you doing today? Let’s talk now.", "Tell us what your community needs next."],
      ["For general enquiries, please fill out the form to get in touch.", "For product demos, community onboarding, partnerships or general enquiries, complete the form below."],
      ["Reason 1", "Product demo"],
      ["Reason 2", "Community onboarding"],
      ["Reason 3", "Partnership enquiry"],
      ["sent message", "send message"],
      ["Hate contact forms? Contact us directly", "Prefer email? Contact Casa Nirvana directly"],
      ["mailto:info@saliver.com", "mailto:hello@casanirvana.app"],
      ["info@saliver.com", "hello@casanirvana.app"],
      ["tel:12345678900", "mailto:hello@casanirvana.app"],
      ["info@saliver.com", "hello@casanirvana.com"],
      ["tel:+(123) 456 789 00", "mailto:hello@casanirvana.com"],
      ["tel:%2B(123)%20456%20789%2000", "mailto:hello@casanirvana.com"],
      ["+(123) 456 789 00", "Email enquiries"],
      ["Saliver Creative", "Casa Nirvana"],
      ["123 Coly new road, Horwich", "Accra"],
      ["Bolton, BL7 9QN", "Ghana"],
      ["The end-to-end payment platform built for growth.", "The connected operations platform built for community life."],
      ["Our team", "About us"],
      ["refund policy", "privacy policy"],
      ["Documentation", "Product overview"],
      ["Getting started", "Plan your rollout"],
      ["Components", "Core features"],
      ["API", "Contact"],
      ["Templates", "Products"],
      ["Public Roadmap", "FAQs"],
      ["Saliver", "Casa Nirvana"],
      ["2025 © All rights reserved by", "2026 © All rights reserved by"],
      ["Bravis-Themes", "Casa Nirvana"],
      ["/service/digital-marketing/", "/residents/"],
      ["/service/website-development/", "/residents/"],
      ["/service/social-media-marketing/", "/security-guards/"],
      ["/service/ui-ux-design/", "/facility-managers/"],
      ["/service/content-writing/", "/marketplace/"],
      ["/service/business-consultancy/", "/core-features/"],
      ["/shop/", "/our-products/"],
    ],
  },
  "/contact-us/": {
    replacements: [
      ["Start for free", "Plan your rollout"],
      ["Hi, how you doing today? Let’s talk now.", "Tell us what your community needs next."],
      ["For general enquiries, please fill out the form to get in touch.", "For product demos, community onboarding, partnerships or general enquiries, complete the form below."],
      ["Reason 1", "Product demo"],
      ["Reason 2", "Community onboarding"],
      ["Reason 3", "Partnership enquiry"],
      ["sent message", "send message"],
      ["Tell us about your project", "Tell us about your community or enquiry"],
      ["Hate contact forms? Contact us directly", "Prefer email? Contact Casa Nirvana directly"],
      ["mailto:info@saliver.com", "mailto:hello@casanirvana.app"],
      ["info@saliver.com", "hello@casanirvana.app"],
      ["tel:+(123) 456 789 00", "mailto:hello@casanirvana.app"],
      ["tel:%2B(123)%20456%20789%2000", "mailto:hello@casanirvana.app"],
      ["tel:12345678900", "mailto:hello@casanirvana.app"],
      ["+(123) 456 789 00", "Email enquiries"],
      ["Saliver Creative", "Casa Nirvana"],
      ["123 Coly new road, Horwich", "Accra"],
      ["Bolton, BL7 9QN", "Ghana"],
      ["https://maps.google.com/maps?q=London%20Eye%2C%20London%2C%20United%20Kingdom&#038;t=m&#038;z=10&#038;output=embed&#038;iwloc=near", "https://maps.google.com/maps?q=Accra%2C%20Ghana&#038;t=m&#038;z=12&#038;output=embed&#038;iwloc=near"],
      ["London Eye, London, United Kingdom", "Accra, Ghana"],
      ["The end-to-end payment platform built for growth.", "The connected operations platform built for community life."],
      ["Our team", "About us"],
      ["refund policy", "privacy policy"],
      ["Documentation", "Product overview"],
      ["Getting started", "Plan your rollout"],
      ["Components", "Core features"],
      ["API", "Contact"],
      ["Templates", "Products"],
      ["Public Roadmap", "FAQs"],
      ["Saliver", "Casa Nirvana"],
      ["2025 © All rights reserved by", "2026 © All rights reserved by"],
      ["Bravis-Themes", "Casa Nirvana"],
      ["/shop/", "/our-products/"],
    ],
  },
};

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

const placeholderRouteByLabel = new Map([
  ["privacy policy", "/privacy-policy/"],
  ["terms & conditions", "/terms-of-service/"],
  ["terms and conditions", "/terms-of-service/"],
  ["plan your rollout", "/contact-us/"],
  ["core features", "/core-features/"],
  ["contact", "/contact-us/"],
  ["products", "/our-products/"],
  ["faqs", "/faqs/"],
]);

function replaceApprovedPlaceholderLinks(source) {
  return source.replace(/<a\b([^>]*?)href=(["'])#\2([^>]*)>([\s\S]*?)<\/a>/gi, (tag, before, quote, after, contents) => {
    const label = contents
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;|&#038;/gi, "&")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    const route = placeholderRouteByLabel.get(label);
    return route ? `<a${before}href=${quote}${route}${quote}${after}>${contents}</a>` : tag;
  });
}

function applySeo(source, route) {
  const seo = snapshotSeo[route];
  if (!seo) throw new Error(`SEO metadata is missing for approved snapshot route: ${route}`);

  const canonicalPath = route === "/" ? "/" : route;
  const canonicalUrl = `${canonicalSiteUrl}${canonicalPath}`;
  const title = `${seo.title} | Casa Nirvana`;
  const socialImage = `${canonicalSiteUrl}/opengraph-image`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${canonicalSiteUrl}/#organization`, name: "Casa Nirvana", url: canonicalSiteUrl },
      { "@type": "WebPage", name: title, description: seo.description, url: canonicalUrl, isPartOf: { "@id": `${canonicalSiteUrl}/#website` }, about: { "@id": `${canonicalSiteUrl}/#software` } },
      { "@type": "WebSite", "@id": `${canonicalSiteUrl}/#website`, name: "Casa Nirvana", url: canonicalSiteUrl, publisher: { "@id": `${canonicalSiteUrl}/#organization` } },
      { "@type": "SoftwareApplication", "@id": `${canonicalSiteUrl}/#software`, name: "Casa Nirvana", applicationCategory: "BusinessApplication", description: "Connected community operations for residents, security guards and facility managers.", url: canonicalSiteUrl, provider: { "@id": `${canonicalSiteUrl}/#organization` } },
    ],
  };
  const seoBlock = [
    "<!-- casa-seo:start -->",
    `<meta name="description" content="${escapeHtml(seo.description)}">`,
    '<meta name="robots" content="index, follow">',
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Casa Nirvana">',
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}">`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}">`,
    `<meta property="og:image" content="${escapeHtml(socialImage)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(socialImage)}">`,
    `<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>`,
    "<!-- casa-seo:end -->",
  ].join("");

  let output = source
    .replace(/<!-- casa-seo:start -->[\s\S]*?<!-- casa-seo:end -->/gi, "")
    .replace(/<meta\b[^>]*(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, "")
    .replace(/<meta\b[^>]*name=["']generator["'][^>]*>/gi, "")
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<link\b[^>]*rel=["']shortlink["'][^>]*>/gi, "")
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  output = output.replace(/<\/head>/i, `${seoBlock}</head>`);
  return output;
}

function applyAccessibilityAndPerformance(source) {
  const supportStyles = [
    "<!-- casa-accessibility:start -->",
    "<style id=\"casa-accessibility-css\">",
    ".casa-skip-link{position:fixed;left:16px;top:16px;z-index:2147483647;transform:translateY(-160%);padding:12px 18px;background:#111;color:#fff;border-radius:4px;text-decoration:none;font-weight:700}",
    ".casa-skip-link:focus{transform:translateY(0)}",
    "a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:3px solid #70d33f!important;outline-offset:3px!important}",
    "#main-content{scroll-margin-top:96px}",
    "@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}",
    "</style>",
    "<!-- casa-accessibility:end -->",
  ].join("");
  const supportScript = [
    '<script id="casa-mobile-nav-accessibility">',
    'document.addEventListener("DOMContentLoaded",function(){',
    'document.querySelectorAll("#pxl-nav-mobile .pxl-nav-mobile-button").forEach(function(button){',
    'var sync=function(){button.setAttribute("aria-expanded",document.body.classList.contains("body-overflow")?"true":"false");};',
    'button.addEventListener("click",function(){setTimeout(sync,0);});',
    'button.addEventListener("keydown",function(event){if(event.key==="Enter"||event.key===" "){event.preventDefault();button.click();}});',
    'sync();',
    '});',
    '});',
    '</script>',
  ].join("");

  let output = source
    .replace(/<!-- casa-accessibility:start -->[\s\S]*?<!-- casa-accessibility:end -->/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (tag) => {
      const value = tag.toLowerCase();
      return ["wp-emoji", "wp-embed", "comment-reply", "wc-cart-fragments", "wc-add-to-cart", "wc-order-attribution", "sourcebuster"].some((marker) => value.includes(marker)) ? "" : tag;
    })
    .replace(/<html\b([^>]*)>/i, (tag, attributes) => {
      let next = attributes;
      if (!/\blang=/i.test(next)) next += ' lang="en"';
      if (!/\bdata-scroll-behavior=/i.test(next)) next += ' data-scroll-behavior="smooth"';
      return `<html${next}>`;
    })
    .replace(/<img\b(?![^>]*\balt=)([^>]*)>/gi, '<img$1 alt="">')
    .replace(/<iframe\b(?![^>]*\btitle=)([^>]*)>/gi, '<iframe$1 title="Casa Nirvana embedded content">')
    .replace(/<(input|textarea|select)\b([^>]*)>/gi, (tag, element, attributes) => {
      if (/\b(?:aria-label|aria-labelledby)=/i.test(attributes)) return tag;
      if (element.toLowerCase() === "input" && /\btype=["']?(?:hidden|submit|button|reset)/i.test(attributes)) return tag;
      const placeholder = /\bplaceholder=["']([^"']+)["']/i.exec(attributes)?.[1];
      const fieldName = /\bname=["']([^"']+)["']/i.exec(attributes)?.[1];
      const label = placeholder || fieldName?.replace(/[-_]+/g, " ");
      return label ? tag.replace(/>$/, ` aria-label="${escapeHtml(label)}">`) : tag;
    })
    .replace(/<a\b([^>]*\btarget=["']_blank["'][^>]*)>/gi, (tag, attributes) => {
      if (/\brel=/i.test(attributes)) return tag;
      return `<a${attributes} rel="noopener noreferrer">`;
    })
    .replace(/<div\b([^>]*\bclass=["'][^"']*\bpxl-nav-mobile-button\b[^"']*["'][^>]*)>/gi, (tag, attributes) => {
      let next = attributes;
      if (!/\brole=/i.test(next)) next += ' role="button"';
      if (!/\btabindex=/i.test(next)) next += ' tabindex="0"';
      if (!/\baria-label=/i.test(next)) next += ' aria-label="Toggle navigation"';
      if (!/\baria-expanded=/i.test(next)) next += ' aria-expanded="false"';
      return `<div${next}>`;
    });

  output = output.replace(/<\/head>/i, `${supportStyles}</head>`);
  if (!/class=["'][^"']*casa-skip-link/i.test(output)) {
    output = output.replace(/<body\b([^>]*)>/i, '<body$1><a class="casa-skip-link" href="#main-content">Skip to main content</a><span id="main-content" tabindex="-1"></span>');
  }
  output = output.replace(/<script\b[^>]*id=["']casa-mobile-nav-accessibility["'][^>]*>[\s\S]*?<\/script>/gi, "");
  output = output.replace(/<\/body>/i, `${supportScript}</body>`);
  return output;
}

let changedRoutes = 0;
let replacementCount = 0;

for (const [route, transform] of Object.entries(routeTransforms)) {
  const page = manifest.pages[route];
  if (!page) throw new Error(`Snapshot route is missing from manifest: ${route}`);

  const filePath = path.join(publicRoot, page.output.replace(/^\/+/, ""));
  const source = await readFile(filePath, "utf8");
  let output = source;

  for (const [from, to] of transform.replacements) {
    const occurrences = output.split(from).length - 1;
    if (!occurrences) continue;
    output = output.replaceAll(from, to);
    replacementCount += occurrences;
  }

  for (const [from, replacements] of transform.sequentialReplacements || []) {
    const occurrences = output.split(from).length - 1;
    if (!occurrences) continue;
    if (occurrences !== replacements.length) {
      throw new Error(`Sequential replacement mismatch for ${route}: expected ${replacements.length} occurrence(s) of "${from}", found ${occurrences}`);
    }
    for (const replacement of replacements) {
      output = output.replace(from, replacement);
      replacementCount += 1;
    }
  }

  for (const [from, to] of sharedLaunchReplacements) {
    const occurrences = output.split(from).length - 1;
    if (!occurrences) continue;
    output = output.replaceAll(from, to);
    replacementCount += occurrences;
  }

  for (const [from, to] of finalRouteReplacements[route] || []) {
    const occurrences = output.split(from).length - 1;
    if (!occurrences) continue;
    output = output.replaceAll(from, to);
    replacementCount += occurrences;
  }

  output = output.replace(/\/wp-login\.php\?action=logout(?:(?:&amp;|&#038;|&)_[^"']+)/gi, "/contact-us/");
  output = replaceApprovedPlaceholderLinks(output);

  output = applySeo(output, route);
  output = applyAccessibilityAndPerformance(output);

  if (output === source) continue;
  await writeFile(filePath, output);
  page.bytes = Buffer.byteLength(output);
  page.sha256 = createHash("sha256").update(output).digest("hex");
  changedRoutes += 1;
}

manifest.contentAppliedAt = new Date().toISOString();
manifest.contentTransform = {
  source: "MARKETING_SITE_PRODUCT_CLAIMS_MATRIX.md",
  routes: Object.keys(routeTransforms),
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`Applied ${replacementCount} content replacements across ${changedRoutes} snapshot route(s).\n`);
