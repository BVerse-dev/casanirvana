# Casa Nirvana Marketing Product Claims Matrix

**Status:** Active launch content source of truth  
**Created:** 2026-07-19  
**Scope:** Marketing claims derived from implemented resident, guard, superadmin, backend, and database-backed surfaces.

## Purpose

This matrix prevents the marketing website from promising features that are only conceptual, partially configured, demo-only, or awaiting production acceptance. A claim marked `Supported` may be used in launch copy with the approved wording below. `Conditional` claims must include the stated qualification. `Blocked` claims must not appear as available launch functionality.

Implementation evidence is not the same as production certification. Final launch claims still depend on release smoke testing, production configuration, and owner approval.

## Status Legend

| Status | Meaning |
| --- | --- |
| `Supported` | The repository contains a wired application flow and supporting apps/api/database contract. |
| `Conditional` | The flow exists but availability depends on provider, module, environment, or unfinished release acceptance. |
| `Blocked` | The capability is incomplete, unconfigured, unverified, or commercially unapproved. Do not advertise it as live. |
| `Excluded` | Demo/theme material or unrelated functionality that must not enter Casa Nirvana launch copy. |

## Approved Product Claims

| Capability | Audience | Status | Safe launch wording | Qualification / prohibited wording | Primary evidence |
| --- | --- | --- | --- | --- | --- |
| Visitor pre-approval and passes | Residents, guards, managers | `Supported` | Residents can pre-register visitors, while guards validate and manage passes at the gate. | Do not claim biometric access or hardware integrations. | `apps/resident-mobile/screens/preApproveVisitorsScreen.js`, `apps/resident-mobile/services/visitorPassService.js`, `apps/guard-mobile/services/visitorEntryService.js`, `apps/api/src/routes/visitor.ts`, `apps/resident-mobile/VISITORS_LIFECYCLE_CONTRACT.md` |
| QR and entry-code validation | Guards | `Supported` | Guards can scan a visitor QR code or enter a pass code to resolve an actionable visitor pass. | Do not claim offline scanning until offline behavior is explicitly accepted. | `apps/guard-mobile/screens/qrScanner.js`, `apps/guard-mobile/screens/confirmScreen.js`, `apps/guard-mobile/SCREEN_WIRING_CHECKLIST.md` |
| Gate entry and exit records | Guards, managers | `Supported` | Record visitor check-in and check-out activity with status-aware entry history. | Say “records” or “history,” not tamper-proof audit ledger. | `apps/guard-mobile/screens/inOutScreen.js`, `apps/guard-mobile/hooks/useVisitorPasses.js`, `apps/guard-mobile/hooks/useVisitorPassCounts.js` |
| Walk-in, cab, delivery, and service entries | Guards, residents | `Supported` | Handle walk-in guests, cabs, deliveries, and service personnel through structured gate-entry flows. | Do not imply third-party delivery or transport integrations. | `apps/guard-mobile/screens/guestEntryScreen.js`, `apps/guard-mobile/screens/cabEntryScreen.js`, `apps/guard-mobile/screens/deliveryEntryScreen.js`, `apps/guard-mobile/screens/serviceEntryScreen.js` |
| Community notices | Residents, managers | `Supported` | Share community notices and keep residents informed through a community-scoped notice board. | Push delivery is not part of this claim. | `apps/resident-mobile/screens/noticeBoardScreen.js`, `apps/resident-mobile/hooks/useListNotices.ts`, `apps/api/src/routes/notice.ts`, `apps/superadmin/src/app/(admin)/post/page.tsx` |
| Complaints and maintenance requests | Residents, managers | `Supported` | Residents can submit and track complaints and maintenance requests, including maintenance attachments. | Do not promise response-time SLAs. | `apps/resident-mobile/screens/complaintsScreen.js`, `apps/resident-mobile/screens/maintenanceRequestsScreen.js`, `apps/resident-mobile/services/complaintService.js`, `apps/resident-mobile/services/maintenanceService.js`, `apps/api/src/routes/complaint.ts`, `apps/api/src/routes/maintenance.ts` |
| Amenities and bookings | Residents, managers | `Supported` | Discover community amenities and manage resident booking requests. | Payment requirements and approval behavior remain community-specific. | `apps/resident-mobile/screens/amenityScreen.js`, `apps/resident-mobile/hooks/useCreateAmenityBooking.ts`, `apps/api/src/routes/amenities.ts`, `apps/superadmin/src/app/(admin)/amenities/bookings/page.tsx` |
| Community directory | Residents, guards, managers | `Supported` | Access a role-aware community directory for authorized community members. | Availability can be disabled through module settings; never describe it as a public directory. | `apps/resident-mobile/screens/memberDirectoryScreen.js`, `apps/resident-mobile/hooks/useCommunityMembers.ts`, `apps/guard-mobile/hooks/useCommunityDirectoryMembers.js` |
| In-app messaging and call records | Residents, guards, managers | `Supported` | Connect authorized residents and guards through community-scoped messaging and in-app call workflows. | Do not describe calls as carrier-grade VoIP or promise call quality/SLA. | `apps/resident-mobile/screens/messageScreen.js`, `apps/resident-mobile/hooks/useMessages.js`, `apps/guard-mobile/screens/messageScreen.js`, `apps/guard-mobile/hooks/useCalls.js`, `apps/api/src/routes/message.ts` |
| Emergency alert triage | Guards, managers | `Supported` | Give guards a community-scoped emergency queue with acknowledgement, investigation, resolution, and admin escalation actions. | Do not market this as an emergency-services replacement or guaranteed emergency response system. | `apps/guard-mobile/hooks/useEmergencyAlerts.js`, `apps/guard-mobile/screens/emergencyScreen.js`, `apps/guard-mobile/screens/emergencyDetailScreen.js`, `apps/api/src/controllers/adminEmergencyAlerts.ts` |
| Resident notifications and realtime updates | Residents, guards | `Supported` | Keep users informed with in-app notifications and realtime updates. | Do not claim production push notifications until provider/device delivery acceptance is complete. | `apps/resident-mobile/hooks/useNotifications.ts`, `apps/resident-mobile/hooks/useRealtimeSubscriptions.ts`, `apps/guard-mobile/hooks/useNotifications.js` |
| Marketplace browsing, cart, checkout records, and order tracking | Residents, managers | `Supported` | Residents can browse community marketplace listings, manage a cart, place orders, and follow order status. | Product inventory, vendor participation, payment methods, and fulfilment depend on configured marketplace data and policy. | `apps/resident-mobile/screens/marketplaceHomeScreen.js`, `apps/resident-mobile/services/marketplaceService.js`, `apps/superadmin/src/app/(admin)/orders/page.tsx`, `apps/api/src/controllers/adminMarketplace.ts` |
| Community and resident administration | Facility managers, platform admins | `Supported` | Manage communities, units, residents, guards, join requests, notices, amenities, service requests, complaints, and visitor operations from one administrative workspace. | Avoid claiming every visible legacy/demo admin route is production-backed. | `apps/superadmin/src/app/(admin)/communities/list/page.tsx`, `apps/superadmin/src/app/(admin)/residents/list-view/page.tsx`, `apps/superadmin/src/app/(admin)/guards/list-view/page.tsx`, `apps/api/src/routes/admin.ts` |
| Guard assignments and module controls | Managers, admins | `Supported` | Configure guard assignments and control which community modules are available. | Do not claim workforce payroll, rostering automation, or geofenced attendance. | `apps/superadmin/src/app/(admin)/guards/assignments/page.tsx`, `apps/superadmin/src/app/(admin)/settings/module-settings/page.tsx`, `apps/guard-mobile/hooks/useGuardModuleAccess.js` |
| Account data export, restore, deactivation, and deletion | Residents | `Supported` | Give residents account controls for data backup, restore, deactivation, and deletion. | Legal retention and restore scope must match the published privacy policy. | `apps/resident-mobile/screens/backupRestoreScreen.js`, `apps/resident-mobile/screens/deleteAccountScreen.js`, `apps/resident-mobile/services/accountService.js`, `apps/api/src/routes/account.ts` |

## Conditional Claims

| Capability | Status | Safe wording | Required launch condition |
| --- | --- | --- | --- |
| Airtime, data, TV, transfer, and other Personal Hub services | `Conditional` | Access supported digital services through a provider-backed Personal Hub catalog. | Only name categories returned by the live ExpressPay catalog and accepted in production. Utilities and insurance currently surface truthful unavailable states when unsupported. |
| Card and mobile-money checkout | `Conditional` | Complete supported payments through the configured hosted checkout methods. | Production payment-gateway configuration and success/failure/fulfilment acceptance must pass. PayPal remains disabled. |
| Email contact delivery | `Blocked` | None until configured. | SMTP password and production delivery acceptance are missing. `/api/contact` correctly returns a normalized unavailable response. |
| Push notifications | `Blocked` | Use “in-app notifications and realtime updates” only. | Provider configuration, physical-device delivery, token rotation, permission, foreground/background, and failure-path acceptance must pass. |
| Pricing | `Blocked` | “Contact us” may be used; no plan prices or entitlements may be published yet. | Commercial owner must approve plans, currency, billing period, taxes, limits, and contract terms. |
| Production uptime, performance, security, and compliance guarantees | `Blocked` | Describe concrete controls only when directly supported and approved. | Requires measured evidence, legal/security approval, and a defined SLA or certification. Never claim “100% secure,” “unhackable,” “99.9% uptime,” or regulatory compliance without evidence. |
| General availability of every application surface | `Blocked` | “Designed for” and precise supported-flow language are permitted. | Full release acceptance, app-store distribution, production environment validation, and owner launch approval remain outstanding. |

## Route Content Boundaries

| Marketing route | Approved content focus | Exclusions / qualifications |
| --- | --- | --- |
| `/` | Connected community operations; residents, guards, and managers; visitor management; notices; service coordination. | No unsupported metrics, customer counts, uptime promises, or fake testimonials. |
| `/about-us/` | Casa Nirvana mission, operating model, and audiences. | No invented history, team, awards, investors, offices, or partnerships. |
| `/our-products/` | Resident app, guard app, facility-management workspace, marketplace, and supported Personal Hub overview. | Distinguish supported, conditional, and planned categories. |
| `/residents/` | Visitor passes, notices, complaints, maintenance, amenities, directory, marketplace, account controls. | Push and provider-backed services require qualifications above. |
| `/security-guards/` | QR/code validation, structured entries, in/out records, emergency triage, directory, communication. | No biometrics, hardware, AI surveillance, offline guarantee, or emergency-services replacement claim. |
| `/facility-managers/` | Communities, units, residents, guards, requests, notices, amenities, visitor oversight, module controls. | Do not expose demo-only superadmin modules as live product capability. |
| `/marketplace/` | Listings, search, cart, addresses, orders, and tracking. | Availability depends on configured vendors, inventory, payment policy, and fulfilment operations. |
| `/pricing/` | Contact-led pricing until commercial approval. | No invented tiers, discounts, limits, or currency. |
| `/faqs/` | Eligibility, onboarding, roles, visitor flow, data/account controls, support boundaries. | Do not fabricate support hours, response SLAs, refund policy, or app-store availability. |
| `/contact/` | General enquiries and onboarding direction. | SMTP-dependent delivery remains blocked; do not display a success state unless the backend accepts the request. |
| `/privacy-policy/` and `/terms-and-conditions/` | Approved legal text only. | Product copy cannot substitute for legal review. |

## Excluded WordPress and Admin Material

- Saliver demonstrations, generic service copy, portfolio examples, grazing posts, T-shirt products, Shop, Cart, Checkout, Wishlist, and unrelated WooCommerce content.
- Superadmin template demonstration pages such as UI kits, chart galleries, icon galleries, sample property/customer/agent modules, and placeholder dashboards unless a separately audited Casa Nirvana flow proves them production-backed.
- Invented testimonials, partner logos, customer counts, transaction volumes, security certifications, response times, savings percentages, or adoption metrics.
- Any references to MockingBird, `/v2/mockup/mockups`, or another project’s routes, data, credentials, or product language.

## Content Approval Rules

1. Every launch feature sentence must map to a row in this matrix.
2. Conditional wording must retain its qualification through design and editorial revisions.
3. New claims require repository/runtime evidence and an update to this matrix before publication.
4. Production acceptance can promote a claim from `Conditional` or `Blocked`, but implementation presence alone cannot.
5. Screenshots and illustrations must depict real Casa Nirvana flows or be clearly conceptual; they must not imply unsupported integrations.

## Evidence Gaps Before Final Copy Signoff

- Physical-device push notification acceptance.
- Production SMTP configuration and contact-email delivery acceptance.
- Production ExpressPay category, payment, reconciliation, and fulfilment acceptance.
- Commercially approved pricing and plan entitlements.
- Final legal approval for privacy and terms.
- App-store availability and links, if launch copy will mention them.
- Approved organization facts, testimonials, logos, metrics, support hours, and service-level commitments.

## Session Log

### 2026-07-19

- Audited resident production wiring, schema alignment, visitor lifecycle contract, guard production wiring, backend route/controller surfaces, and superadmin route inventory.
- Established safe wording for implemented visitor, community operations, communication, emergency, marketplace, administration, and account-control capabilities.
- Marked SMTP contact delivery, push delivery, pricing, unsupported provider categories, and unsupported guarantees as blocked or conditional.
- Recorded demo/theme/admin exclusions so they cannot be mistaken for Casa Nirvana launch functionality.
