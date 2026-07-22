# Casa Nirvana Marketing Site Implementation Checklist

Status opened: 2026-07-15  
Launch classification: P0 public launch requirement  
Visual authority: local WordPress reference under `wordpress/`

## Working rules

- [x] Treat the migration as a technology conversion, not a redesign.
- [x] Use `docs/MARKETING_SITE_PARITY_CONTRACT.md` as the visual acceptance contract.
- [x] Keep credentials, SQL exports, WordPress core, plugins, uploads and licensed parent-theme source untracked.
- [ ] Mark a route complete only after evidence exists at every required viewport.
- [ ] Record every intentional visual difference and obtain explicit approval.

## Source freeze and extraction

- [x] Sync the complete local WordPress runtime into the worktree as an ignored reference.
- [x] Track only the custom `saliver-child` theme and WordPress reference documentation.
- [x] Add repeatable WordPress SQL/Elementor parity extractor.
- [x] Add committed route, layout, breakpoint, font and asset parity manifest.
- [ ] Run the extractor against the final pre-cutover WordPress export and review parsing failures.
- [ ] Confirm the active WordPress front page, header and footer IDs in WordPress Admin.

## Next.js application foundation

- [x] Create isolated Next.js 16 application at `apps/marketing-web/` with an independent npm lockfile boundary.
- [x] Add App Router, TypeScript, ESLint, local fonts, metadata, sitemap, robots, favicon, Open Graph image and error page.
- [x] Add Saliver-compatible global visual primitives without a replacement component library.
- [x] Add accessible sticky header, product navigation, mobile menu and footer.
- [x] Add typed repository-managed marketing content.
- [x] Add root orchestration commands without moving existing applications.
- [x] Complete dependency install and record build evidence. Evidence: independent npm lockfile installed; lint, type-check, tests and Next.js 16.2.10 production build passed on 2026-07-15.

## Route implementation and parity

| Route | Implementation | Desktop | Tablet | Mobile | Approved |
| --- | --- | --- | --- | --- | --- |
| `/` | DONE | TODO | TODO | TODO | TODO |
| `/about-us` | DONE | TODO | TODO | TODO | TODO |
| `/our-products` | DONE | TODO | TODO | TODO | TODO |
| `/residents` | DONE | TODO | TODO | TODO | TODO |
| `/security-guards` | DONE | TODO | TODO | TODO | TODO |
| `/facility-managers` | DONE | TODO | TODO | TODO | TODO |
| `/marketplace` | DONE | TODO | TODO | TODO | TODO |
| `/core-features` | DONE | TODO | TODO | TODO | TODO |
| `/pricing-plans` | DONE | TODO | TODO | TODO | TODO |
| `/faqs` | DONE | TODO | TODO | TODO | TODO |
| `/contact-us` | DONE | TODO | TODO | TODO | TODO |
| `/privacy-policy` | DONE | TODO | TODO | TODO | TODO |
| `/terms-of-service` | DONE | TODO | TODO | TODO | TODO |

## Forms and backend interfaces

- [x] Add same-origin `POST /api/onboarding` proxy with server-only onboarding API key.
- [x] Preserve canonical backend `POST /onboarding/requests` payload and role contract.
- [x] Add same-origin `POST /api/contact` proxy and backend `POST /contact/requests` delivery path.
- [x] Reuse secured backend SMTP configuration and normalized API errors.
- [x] Add API-key enforcement, request validation, payload limits, rate limiting, honeypots and duplicate-submit guards.
- [x] Add accessible pending, success and failure states.
- [x] Verify onboarding creation against the deployed backend and admin review workspace. Evidence: production request returned HTTP 201 and created synthetic acceptance row `d93641bd-48b3-4d38-8ddb-8ed305ec8c36`.
- [ ] Verify contact delivery against production SMTP and recipient configuration. The production API key is accepted; SMTP delivery remains the blocker.

## SEO, accessibility and quality

- [x] Add canonical route metadata, redirects, structured data, sitemap, robots and social image generation.
- [x] Add skip link, focus treatment, semantic controls, labels, live regions and reduced-motion behavior.
- [x] Add unit coverage for form validation and backend contact/API-key behavior.
- [x] Run marketing lint, type-check, tests and production build. Evidence: ESLint, TypeScript, `2/2` Vitest tests, and Next.js `16.2.10` production build passed on 2026-07-15; `22` routes generated.
- [ ] Run broken-link, keyboard, console and metadata checks on preview.
- [ ] Replace provisional Privacy Policy and Terms copy with approved legal text.

## Deployment and cutover

- [x] Add additive marketing CI job definition and Vercel project configuration.
- [x] Create/link the dedicated Vercel project rooted at `apps/marketing-web`.
- [~] Configure preview and production environment variables. Production is complete; Preview is missing the five release-required variables and fails before build.
- [ ] Record preview URL and complete six-viewport parity review.
- [ ] Record WordPress last-known-good export and rollback owner.
- [ ] Approve domain redirects, DNS cutover and post-deploy monitoring window.
- [ ] Keep WordPress non-public but recoverable through the rollback window.

## Current execution sequence

- [~] Step 1: verify the shared WordPress visual system and homepage at all six required viewports.
- [ ] Step 2: verify remaining routes in approved order and record route-level evidence.
- [ ] Step 3: verify onboarding and contact delivery against deployed backend services.
- [ ] Step 4: complete preview accessibility, links, console, metadata and SEO checks.
- [ ] Step 5: configure Vercel production, cutover and rollback evidence.
- [ ] Step 6: begin physical monorepo moves only after launch stability is approved.

## Session log

- 2026-07-19: Production stabilization continued on the canonical `casanirvana.app` deployment. Pinned marketing to Vercel-supported Node `22.x`; aligned `outputFileTracingRoot` and `turbopack.root` to the monorepo root; production build and deployment passed without the prior root mismatch. Restored exact WordPress hero form geometry, hid only empty legacy Contact Form 7 response containers, confirmed zero-pixel CTA/input offset and zero fresh console errors in the Codex browser. Onboarding remains verified. The marketing contact API key now reaches the SMTP path, but delivery remains open pending working SMTP credentials. Preview builds remain blocked by missing Preview-scoped release variables, and the Vercel dashboard runtime still needs to be changed from `20.x` to `22.x`.

- 2026-07-19: Corrected stale tracking state by marking dependency/build evidence complete, replacing the obsolete WordPress-onboarding war-room label with the active Next.js proxy flow, and adding the ordered Phase 50/51 execution sequence. A fresh Codex in-app browser profile and fresh tab still reject `http://localhost:3001/` with `ERR_BLOCKED_BY_CLIENT`; homepage parity evidence remains blocked until Codex can access localhost or external WordPress and Next.js preview URLs are available.

- 2026-07-15: Verified the Casa Nirvana workspace contains no Mockingbird files, imports, routes, or `/v2/mockup` callers. Standardized the root `dev:marketing` command on port `3001` to isolate Casa Nirvana from Mockingbird browser cache/service-worker state commonly associated with `localhost:3000`.
- 2026-07-15: Confirmed the observed `GET /v2/mockup/mockups 404` has no caller or route anywhere in the marketing application or repository and is an external browser/development-tool probe; no fake compatibility endpoint was added. Added Next.js's required `data-scroll-behavior="smooth"` declaration to the root document to preserve the approved smooth-scroll behavior without route-transition warnings.
- 2026-07-15: Repeatable extraction generated `11` approved WordPress page records. Marketing lint/typecheck/tests/build passed; backend contact/API-key tests passed `8/8` and backend build passed. Next.js was upgraded to patched `16.2.10`. Nodemailer was subsequently upgraded to patched `9.0.3`; backend tests/build still pass and the production-only backend audit reports zero vulnerabilities. Remaining release blockers include six-viewport parity evidence, browser/accessibility checks, live form delivery, Vercel/cutover/rollback evidence, and a moderate transitive Next/PostCSS advisory with no safe supported update.
- 2026-07-15: Started the marketing development server at `http://localhost:3001/`. Automated in-app browser access is blocked by the localhost browser boundary, and the WordPress reference at `http://localhost:8882/` is currently stopped. The claimable Vercel preview upload was accepted and began building, but the service returned no preview or claim URL; no duplicate deployment was created. Manual browser navigation plus WordPress runtime restart are required before parity capture can continue.
- 2026-07-15: Synced the WordPress reference, established parity and monorepo contracts, created the Next.js marketing application and approved route set, added secure onboarding/contact interfaces, root orchestration, SEO foundations, and additive CI/deployment configuration. Visual parity and runtime evidence remain intentionally open.

### 2026-07-19 - WordPress parity extraction contract completed

- Upgraded the repeatable WordPress extractor to schema version 2.
- Captured approved route hierarchy, widget settings, responsive overrides, animation values, color/font tokens, effective shared header/footer templates, Elementor kit settings, comparison viewports, and normalized media paths.
- Regenerated `apps/marketing-web/reference/wordpress-parity.generated.json` from the immutable WordPress Studio SQL export.
- Browser-assisted comparison remains blocked by Codex `ERR_BLOCKED_BY_CLIENT`; manual Chrome/Safari parity signoff will be supplied by the project owner.
- Next execution item: use the extracted Home, header, and footer specifications for shared-shell and homepage parity corrections.

### 2026-07-19 - Home 03 structural parity pass

- Replaced the shortened dashboard-led homepage sequence with the approved WordPress Home 03 structural flow.
- Added the missing device marquee, platform showcase, proof metrics, operational accordion, setup visual, integrations panel, mobile-download block, and device CTA composition.
- Retained final Casa Nirvana product copy and excluded demo blog/shop content as required by the migration scope.
- Ported only the additional media used by the approved homepage route.
- Manual six-viewport Chrome/Safari visual review remains required before the Home route can be marked parity-complete.
- Next execution item: collect manual homepage differences, correct the shared header/footer and Home details, then record route signoff evidence.

### 2026-07-19 - Saliver shared-shell fidelity correction

- Replaced the generic sticky navigation treatment with the Home 03 floating 66px header shell and scroll state.
- Corrected the marketing typography foundation to Plus Jakarta Sans and aligned the Home 03 green, spacing, radius, and hero scale tokens.
- Replaced the hero button group with the WordPress-style inline email capture composition while retaining the server-mediated onboarding destination.
- Rebuilt the footer as the approved light multi-column Saliver layout with a separate dark newsletter panel.
- Preserved the Saliver heading, subtitle, animation, button, and layout class hierarchy where it controls visual behavior.
- Manual six-viewport comparison remains required; no shared-shell or Home route parity signoff has been claimed.

## 2026-07-19 - Exact rendered WordPress capture and Next.js routing

- Status: capture and mechanical routing complete; route-by-route visual parity signoff remains open.
- Added the reproducible `npm --prefix apps/marketing-web run capture:wordpress` exporter with serialized requests, bounded lock retries, recursive public-link discovery, resumable captures, origin rewriting, and asset dependency discovery.
- Captured 107 successfully rendered public WordPress documents into `apps/marketing-web/public/wordpress-snapshot/pages`.
- Mirrored 636 CSS, JavaScript, image, icon, and font dependencies under their original `wp-content` and `wp-includes` paths with zero asset failures.
- Evidence manifest: `apps/marketing-web/public/wordpress-snapshot/manifest.json` (generated 2026-07-19T13:15:27.527Z).
- Added manifest-driven `beforeFiles` rewrites in `apps/marketing-web/next.config.ts`; captured routes now serve the unchanged WordPress-rendered documents while native `/api/contact` and `/api/onboarding` routes remain available.
- Source defect recorded: WordPress links to `/our-services/`, but the source route returns HTTP 404. No replacement page was fabricated.
- Production build evidence: Next.js 16.2.10 build passed on 2026-07-19; production preview restarted and ready on `http://localhost:3001`.
- Still open: six-viewport visual comparison, navigation/animation/browser-console signoff, replacement of WordPress form/AJAX runtime dependencies, canonical/SEO origin normalization, explicit decision on demo/shop/blog content removal, and deployment/cutover gates.

## 2026-07-19 - Launch hardening and content migration plan approved for execution

- Detailed plan: `MARKETING_SITE_LAUNCH_IMPLEMENTATION_PLAN.md`.
- The committed rendered snapshot is now the immutable visual baseline; WordPress regeneration is not part of the normal editing workflow after parity approval.
- Work is gated in this order: fidelity evidence, WordPress runtime removal, native forms/interactions, product claims and typed content, route cleanup, SEO/accessibility/performance, then deployment/cutover.
- Content replacement cannot begin on a route until its visual structure is accepted, preventing copy and layout defects from being mixed.
- Immediate active task: create the P0 route parity matrix and complete Home comparisons at all six required viewports.

## 2026-07-19 - P0 parity matrix and first runtime corrections

- Created `MARKETING_SITE_P0_PARITY_MATRIX.md` with 12 P0 launch routes, six required viewports, interaction/runtime/content/SEO states, evidence rules, and Home manual signoff rows.
- Verified the Next.js Home response is byte-identical to the committed 611,042-byte captured Home document before normalization.
- Identified and corrected escaped `localhost:8882` references through the repository-only `prepare:snapshot` command; all 107 documents now pass with zero Studio-origin references.
- Aligned Next.js with the WordPress trailing-slash canonical policy; all ten captured P0 routes return direct HTTP 200 with zero redirects.
- Marketing production build passed and the port 3001 production preview was restarted successfully.
- Still open: WordPress admin/REST/AJAX/XML-RPC removal, Contact Form 7 replacement, WooCommerce disposition, Privacy and Terms routes, and six-viewport browser signoff.
- Environment blocker: the Codex in-app browser still reports both local ports unreachable in this workspace. Visual rows remain `BLOCKED`, not falsely marked complete; Chrome/Safari manual evidence is required unless local Codex browser access is restored.

## 2026-07-19 - WordPress control-plane cleanup

- Extended `prepare:snapshot` to remove the authenticated Studio admin toolbar, forced admin top margins, WooCommerce admin-status badge CSS, Bertha editor assets/configuration/nonces, REST/oEmbed discovery, XML-RPC metadata, admin AJAX endpoints, and Contact Form 7 JavaScript.
- Preserved Contact Form 7 CSS temporarily so form appearance remains unchanged until native Next.js form submission is connected.
- Preserved Saliver, Bravis, Elementor frontend, carousel, accordion, GSAP, and animation assets required by the approved public presentation.
- Acceptance scan across all 107 documents: zero `localhost:8882`, `/wp-admin/`, `/wp-json/`, `xmlrpc.php`, `wpadminbar`, `bertha-ai-free`, and `contact-form-7-js` references.
- Marketing production build passed and the cleaned preview was restarted on `http://localhost:3001`.
- Still open: browser network/interaction signoff, native contact/onboarding form binding, WooCommerce keep/remove decision, and visual viewport evidence.

## 2026-07-19 - Native form adapter checkpoint

- Added `public/assets/casa-native-forms.js` and injected it deterministically into all 107 captured documents through `prepare:snapshot`.
- Full Contact Form 7 markup now maps to same-origin `POST /api/contact`: name, email, phone, enquiry reason, message, and honeypot fields are normalized without changing the preserved containers or CSS.
- Added accessible inline errors, `aria-invalid`, polite status announcements, pending/success/failure states, disabled-submit duplicate prevention, and exact restoration of original submit-button markup.
- Home email-only get-started forms now validate email and hand off to `/get-started/?email=...`; the native onboarding form safely pre-fills that email while still requiring role and full name.
- Home name/email subscription now sends an explicit product-updates contact enquiry; it does not fabricate onboarding data.
- Non-submitting evidence passed: adapter appears once, Contact Form 7 CSS remains, Contact Form 7 JavaScript remains absent, onboarding email prefill renders, and Studio origins remain absent.
- Marketing production build passed; `/get-started/` is intentionally dynamic for query prefill; port 3001 preview restarted successfully.
- Still open: controlled backend delivery test, browser validation/pending/success/failure screenshots, rate-limit evidence, and final form copy/options during content migration.

## 2026-07-19 - Controlled marketing delivery test

- Added network exception boundaries to both Next.js marketing proxies; backend connection failures now return normalized JSON HTTP 503 responses rather than uncaught empty HTTP 500 responses.
- Restored the confirmed Casa Nirvana Supabase project `pswnlowvmdgeifhxilao`; lifecycle reached `ACTIVE_HEALTHY`. MockingBird was not touched.
- Verified local backend health on port 8080 and successful REST access to `admin_onboarding_requests`.
- Onboarding passed end to end with HTTP 201. Verified synthetic row ID `d93641bd-48b3-4d38-8ddb-8ed305ec8c36`, status `pending`, role `facility_manager`, source `marketing_web`, email `launch.qa+20260719154216@casanirvana.app`.
- Contact proxy and backend failure handling passed, returning normalized HTTP 503.
- Contact delivery remains blocked by SMTP configuration: host, sender, and username are present; encrypted SMTP password is absent; SMTP test mode is off.
- Marketing production build passed and port 3001 was restarted with the proxy error-boundary changes.
- Still open: configure/test SMTP without sharing credentials in source or chat, decide whether to retain or remove the synthetic onboarding row, and capture browser form-state evidence.

## 2026-07-19 - Product Claims Source-of-Truth Audit

- **Status:** Complete for implementation-backed launch wording; production and owner acceptance gates remain open.
- Created `MARKETING_SITE_PRODUCT_CLAIMS_MATRIX.md` from resident, guard, superadmin, backend, and database contract evidence.
- Approved qualified launch claims for visitor management, community operations, notices, complaints, maintenance, amenities, messaging, emergency triage, marketplace, administration, and account controls.
- Marked SMTP contact delivery, push delivery, pricing, unsupported Personal Hub categories, production guarantees, and full general availability as blocked or conditional.
- Excluded Saliver demos, unrelated WooCommerce content, superadmin template galleries, invented metrics/testimonials, and all MockingBird project material.
- SMTP is intentionally deferred at the owner’s request until secure credentials are available. Keep the P0 contact-delivery gate open; do not weaken failure behavior or publish a false success state.
- The successful onboarding QA row `d93641bd-48b3-4d38-8ddb-8ed305ec8c36` remains untouched as acceptance evidence pending an explicit cleanup decision.
- **Next step:** Use the claims matrix to replace WordPress/demo text route by route without changing the approved mirrored HTML structure, classes, visual layout, assets, or animation behavior.

### 2026-07-19 - Home Snapshot Content Pass 1

- Added repeatable `apps/marketing-web/scripts/apply-casa-content.mjs` and `npm run apply:content`.
- Applied 90 exact content/link replacements directly to the captured Home HTML while preserving WordPress markup, classes, assets, CSS, and animation hooks.
- Removed or qualified Saliver attribution, grazing/demo posts, stock-screener copy, fake metrics, unsupported trial/commercial promises, broad integration claims, unverified app-download wording, and unrelated shop destinations.
- Updated the snapshot manifest hash/size metadata through the transform.
- Marketing production build passed on Next.js 16.2.10 and the refreshed preview is running at `http://localhost:3001`.
- **Acceptance status:** Content implementation complete for Pass 1; manual browser visual/text review remains required before route signoff.
- **Next route:** `/about-us/`, followed by `/our-products/`, using the same markup-preserving transform method.

### 2026-07-19 - About and Products Snapshot Content Pass 1

- Extended `apply-casa-content.mjs` to `/about-us/` and `/our-products/` without changing captured markup, CSS classes, media, section order, or animation hooks.
- Applied 181 exact replacements across the two routes.
- Removed fabricated adoption metrics, ROI, testimonials, partnerships, ISO 27001/27701, SOC 2, blanket GDPR certification, fixed pricing promises, wallet behavior, unsupported provider/API claims, Saliver contacts, portfolio demos, and unrelated shop destinations.
- Replaced the removed material with implementation-backed visitor, resident, guard, facility, marketplace, account, scoped-access, and conditional Personal Hub wording from `MARKETING_SITE_PRODUCT_CLAIMS_MATRIX.md`.
- Snapshot hashes/sizes refreshed, marketing production build passed, and preview restarted at `http://localhost:3001`.
- **Acceptance status:** Content Pass 1 complete; owner desktop/mobile visual and editorial review remains open.
- **Next routes:** `/residents/`, then `/security-guards/`.

### 2026-07-19 - Residents and Security Guards Snapshot Content Pass 1

- Extended the deterministic snapshot transform to `/residents/` and `/security-guards/`.
- Applied 142 exact text replacements while preserving captured HTML, classes, section order, assets, responsive behavior, and animation hooks.
- Residents now describes verified visitor passes, amenities, requests, complaints, maintenance, notices, directory, marketplace, in-app updates, and explicitly conditional Personal Hub categories.
- Security Guards now describes verified QR/code resolution, structured guest/cab/delivery/service entry, check-in/out, module-aware directory access, messaging, calls, notifications, and emergency triage.
- Removed generic SaaS/AI, Slack/Zoom/Jira/Zapier, fake adoption, trial, cross-platform guarantee, broad integration, unsupported event/poll, and unqualified utility/insurance wording.
- Snapshot integrity metadata refreshed, marketing production build passed, and preview restarted at `http://localhost:3001`.
- **Acceptance status:** Content Pass 1 complete for both routes; owner desktop/mobile review remains open.
- **Next routes:** `/facility-managers/`, then `/marketplace/`.

### 2026-07-19 - Facility Managers and Marketplace Snapshot Content Pass 1

- Extended the deterministic snapshot transform to `/facility-managers/` and `/marketplace/`.
- Applied 159 exact text replacements while retaining captured HTML, classes, assets, section order, responsive behavior, and animation hooks.
- Facility Managers now reflects implemented community, unit, resident, guard, visitor, request, notice, amenity, module-setting, and qualified payment-administration workflows.
- Marketplace now reflects implemented categories, product search/details, cart, addresses, orders, tracking, and scoped administration while qualifying inventory, vendor, checkout, and fulfilment availability.
- Removed generic AI marketing, free-trial/free-forever claims, Zapier/CRM/ERP/API claims, MFA claims, fake adoption metrics, and unsupported universal marketplace/payment promises.
- Snapshot integrity metadata refreshed, marketing production build passed, and preview restarted at `http://localhost:3001`.
- **Acceptance status:** Content Pass 1 complete for both routes; owner desktop/mobile review remains open.
- **Next routes:** `/pricing-plans/` and `/core-features/`, followed by FAQs/contact/legal route reconciliation.

### 2026-07-19 - Pricing and Core Features Snapshot Content Pass 1

- Extended the deterministic snapshot transform to `/pricing-plans/` and `/core-features/`.
- Applied 228 exact replacements while preserving the captured WordPress layout, classes, assets, responsive behavior, and animation hooks.
- Pricing now presents contact-led rollout scopes without invented prices, discounts, guarantees, user limits, support levels, or competitor comparisons.
- Core Features now explains verified visitor, request, amenity, communication, marketplace, payment, realtime in-app update, module-control, and role-aware administrative workflows.
- Removed generic AI, DevOps/CI/CD, CRM, Zapier, IoT, offline-mode, universal push, fake testimonial/metrics, and unsupported integration wording.
- Snapshot integrity metadata refreshed, marketing production build passed, and preview restarted at `http://localhost:3001`.
- **Acceptance status:** Content Pass 1 complete for both routes; owner desktop/mobile review remains open.
- **Next routes:** `/faqs/` and `/contact-us/`, retaining the SMTP delivery gate as open.

### 2026-07-19 - FAQs and Contact Snapshot Content Pass 1

- Extended the deterministic snapshot transform to `/faqs/` and `/contact-us/`.
- Applied 154 exact replacements across the target/shared snapshot content while preserving captured HTML, form markup, classes, assets, responsive behavior, and animation hooks.
- Replaced marketing-agency service cards and generic SaaS answers with verified Casa Nirvana rollout, role, visitor, payment, integration, module, and operational guidance.
- Replaced Saliver email, fake phone, UK address, company name, enquiry reasons, footer identity, and unrelated service/shop destinations with Casa Nirvana information and routes.
- Preserved the native Contact Form 7 visual structure and existing `/api/contact` adapter behavior.
- SMTP remains intentionally deferred and the P0 delivery gate remains open; the form must continue to display a truthful unavailable response until credentials and delivery acceptance exist.
- Snapshot integrity metadata refreshed, marketing production build passed, and preview restarted at `http://localhost:3001`.
- **Acceptance status:** Content Pass 1 complete; owner desktop/mobile review and SMTP delivery acceptance remain open.
- **Next step:** Reconcile privacy/terms availability, navigation/footer route destinations, and remove public exposure of excluded snapshot routes without deleting rollback source files.

### 2026-07-19 - Launch Route Containment, Shared Navigation, and Legal Draft Gate

- Restricted snapshot rewrites to the 11 approved launch routes; the 96 captured demo/reference pages remain in rollback source files but are no longer served directly through manifest rewrites.
- Added permanent redirects for legacy About/Products/Pricing/Contact/Terms paths plus demo careers, blogs, services, portfolios, shops, products, tags, categories, authors, and grazing article routes.
- Added shared launch replacements across all approved snapshots for Blog -> Pricing, onboarding/demo actions, footer labels, legal destinations, documentation placeholders, cart/shop language, and excluded route links.
- Applied 224 shared replacements across all 11 approved snapshot routes without altering their captured visual structures.
- Marked Privacy Policy and Terms of Service visibly as drafts and added explicit legal-review status sections. These routes must not be considered release-approved until counsel/owner approval is recorded.
- Snapshot integrity metadata refreshed, redirect configuration passed the Next.js production build, and preview restarted at `http://localhost:3001`.
- **Open P0 gates:** legal approval, SMTP contact delivery, manual six-viewport parity review, production deployment/configuration, and cutover acceptance.
- **Next step:** SEO metadata/canonical/sitemap/robots reconciliation against the approved route allowlist, followed by accessibility and performance hardening.

### 2026-07-19 - SEO, Canonical, Sitemap, and Robots Reconciliation

- Added deterministic route-specific titles and descriptions for all 11 approved snapshot routes.
- Snapshot transformation now removes conflicting WordPress description/canonical/social tags and injects one canonical, robots directive, Open Graph set, Twitter card set, and Organization/WebSite/WebPage/SoftwareApplication JSON-LD graph per route.
- Canonicals use `NEXT_PUBLIC_SITE_URL` when supplied, with the owner-confirmed `https://casanirvana.app` as the production fallback.
- Rebuilt sitemap from an explicit indexable route allowlist with stable change frequencies/priorities and no artificial build-time `lastModified` churn.
- Excluded draft Privacy and Terms routes from the sitemap and marked both `noindex, nofollow` until legal approval.
- Updated robots to disallow API paths and direct `/wordpress-snapshot/` paths while keeping required public assets crawlable.
- Removed the unaccepted explicit iOS/Android operating-system claim from fallback structured data.
- Applied SEO blocks to all 11 snapshots, refreshed integrity metadata, passed the Next.js production build, and restarted preview at `http://localhost:3001`.
- **Acceptance status:** SEO implementation complete; canonical production domain, legal approval, and deployed social-preview verification remain open.
- **Next step:** Accessibility and performance hardening that does not alter visual parity, followed by manual six-viewport evidence.

### 2026-07-19 - Accessibility and Performance Static Hardening

- Added a keyboard-visible skip link and stable `#main-content` target to all 11 approved snapshot documents.
- Added `:focus-visible` treatment for links, buttons, fields and custom focusable elements without changing default visual presentation.
- Added reduced-motion handling that disables smooth scrolling and collapses animation/transition duration only when the user requests reduced motion.
- Added English document language and the Next.js smooth-scroll declaration to each captured document.
- Added accessible-name fallbacks for legacy form fields, empty alt fallbacks for images lacking alt attributes, iframe title fallbacks, and `noopener noreferrer` for unqualified new-tab links.
- Removed nonessential WordPress emoji/embed/comment and WooCommerce cart/order-attribution scripts from approved marketing snapshots.
- Added immutable one-year caching for local assets, fonts, WordPress theme assets and WordPress include assets, plus safe content-type/referrer/permissions response headers.
- Added `npm run audit:snapshot`, enforcing SEO uniqueness, language, skip navigation, reduced motion, structured data, image/iframe fallbacks, and removal of WordPress control endpoints/Studio origins across all approved routes.
- Static snapshot audit passed for 11 routes; Next.js production build passed; preview restarted at `http://localhost:3001`.
- **Acceptance status:** Static accessibility/performance hardening complete. Manual keyboard navigation, screen-reader behavior, animation review, browser console review and six-viewport parity evidence remain open.
- **Next step:** Browser/manual acceptance matrix and release deployment preparation; SMTP/legal/canonical-domain decisions remain external P0 inputs.

### 2026-07-19 - Manual Acceptance and Deployment Preparation

- Created `MARKETING_SITE_MANUAL_ACCEPTANCE_CHECKLIST.md` with all 11 approved routes across 1440x900, 1280x800, 1024x768, 768x1024, 390x844, and 360x800.
- Added shared visual, mobile navigation, keyboard, assistive technology, form, SEO, performance, legal, cutover, rollback, and signoff evidence gates.
- Preserved prior controlled onboarding success and contact-unavailable evidence without incorrectly marking untested browser flows complete.
- Corrected the local marketing environment template from port 3002 to port 3001.
- Added a secret-free production environment template and `npm run verify:release-env` to reject missing, local, non-HTTPS, short, or reused production configuration values without printing secrets.
- Vercel build now runs release-env verification, the snapshot audit, and the production build.
- Added preview-only `X-Robots-Tag: noindex, nofollow, noarchive` protection.
- Marketing production build passed and preview restarted at `http://localhost:3001`.
- **Acceptance status:** Deployment preparation complete. Manual parity/keyboard evidence, canonical-domain confirmation, SMTP delivery, legal approval, deployed preview checks, DNS cutover and rollback signoff remain open.
- **Next step:** Owner executes the manual acceptance matrix in Chrome/Safari, then configure and deploy the Vercel preview when the canonical domain and required environment values are confirmed.

### 2026-07-19 - Production Domain Confirmation

- Owner confirmed `https://casanirvana.app` as the primary marketing domain.
- Owner confirmed `https://admin.casanirvana.app` as the superadmin domain.
- Updated marketing canonical fallback, sitemap/robots production fallback, production/local environment templates, admin destination, legal URL defaults, superadmin website/security placeholders, and resident/guard About website labels.
- Preserved existing `@casanirvana.com` email addresses because web-domain confirmation does not authorize an email-domain migration.
- Regenerated all 11 snapshot SEO blocks against `https://casanirvana.app` and passed the static snapshot audit.
- Backend, superadmin and marketing production builds all passed; marketing preview restarted at `http://localhost:3001`.
- **Canonical-domain gate:** Complete.
- **Vercel action:** Production `NEXT_PUBLIC_SITE_URL` must equal `https://casanirvana.app` and `NEXT_PUBLIC_ADMIN_URL` must equal `https://admin.casanirvana.app` exactly.

## Session record - 2026-07-19 - Monorepo deployment readiness

- Status: mechanical transition complete and published to remote `main` at `66f6aa02`.
- Marketing source and independent lockfile remain at `apps/marketing-web`.
- Production build passed through the root orchestration command.
- Production preview is available at `http://localhost:3001` from the final application root.
- Vercel project root: `apps/marketing-web`.
- Production domain: `https://casanirvana.app`.
- Superadmin companion domain: `https://admin.casanirvana.app`.
- Release gate completed: the repository transition is on remote `main`; the marketing Vercel project can now be created or linked with Root Directory `apps/marketing-web`.
- Rollback: preserve the WordPress reference/export and do not cut over the public domain until all marketing P0 gates pass.

## Session record - 2026-07-19 - Production hosting and asset-runtime hardening

- Hosting topology confirmed: marketing deploys directly from monorepo root `apps/marketing-web`; superadmin and API deploy from synchronized split repositories with blank hosting roots.
- Render API split commit `37f878a9c2932fc062eb1d6da09b598f9a20697c` built successfully with `npm ci && npm run build`, reported zero dependency vulnerabilities, started successfully, and returned external `/health` status `200`.
- Superadmin split commit `9deeb1f64426979e175d3859d8276fffacdae6e2` is represented by the current Ready production deployment. A failed unpromoted candidate exposed the split-repository topology; the Vercel root was restored to blank and production was not replaced.
- Marketing status and metadata audit passed for 12 indexed routes; `www.casanirvana.app` redirects to `casanirvana.app` with `308`.
- Browser audit found the captured homepage loading 141 scripts, including WordPress editor/admin, WooCommerce, and Contact Form 7 runtime. The resulting request burst triggered Vercel Security Checkpoint responses and genuine missing-global/chunk errors.
- Snapshot normalization now removes non-public WordPress runtime, retains the required visual frontend runtime, and includes the two Elementor lazy chunks required by the approved pages.
- Evidence: snapshot audit passed for all 11 approved mirrored routes and the Next.js production build passed.
- [ ] Deploy this runtime-hardening change and repeat production console/network checks before closing the marketing P0 gate.
- [ ] Add Privacy and Terms routes to the approved sitemap after legal copy is approved.
- [ ] Configure `SENTRY_DSN` or explicitly accept deferred backend error telemetry before release freeze.
## 2026-07-19 - Production route acceptance and encoded-content cleanup

- [x] Ran the 12 approved public routes across all six required viewports (72 rendered states): `1440x900`, `1280x800`, `1024x768`, `768x1024`, `390x844`, and `360x800`.
- [x] Confirmed zero horizontal overflow, zero broken images, and zero browser console errors across the route matrix.
- [x] Confirmed homepage hero form geometry at every viewport: CTA and email field retain matching `54px` heights and zero top/bottom offset.
- [x] Confirmed the empty legacy Contact Form 7 response element remains hidden and no longer renders the erroneous green bar.
- [x] Removed remaining rendered Saliver/demo copy found in the homepage, Facility Managers, Pricing, FAQs, and shared footer without changing Elementor structure or CSS.
- [x] Removed stale WordPress logout URLs, the duplicate `/about-company/` link, and the ThemeForest footer destination from approved snapshots.
- [x] Production deployment for commit `6a4bbd82` is Ready and aliased to `casanirvana.app` and `www.casanirvana.app`.
- [ ] Legal approval is still required before removing `Draft` from Privacy Policy and Terms of Service.
- [ ] SMTP credentials and a successful production contact-delivery receipt remain required.
- [ ] Preview-scoped Vercel environment variables remain incomplete; Preview builds continue to fail the intentional release-environment gate.
- [ ] Change the Vercel project dashboard Node.js setting from `20.x` to `22.x`; `package.json` already enforces Node `22.x` for builds.
## 2026-07-19 - Footer routing and mobile navigation accessibility

- [x] Replaced recognized `href="#"` footer placeholders with approved Privacy, Terms, Contact, Core Features, Products, FAQs, and rollout routes while preserving the mirrored anchor markup.
- [x] Left four icon-only social placeholders unchanged because no approved Casa Nirvana profile URLs are available.
- [x] Verified mobile navigation opens by pointer and exposes Home, About Us, Products, Core Features, Pricing, Contact Us, and FAQs.
- [x] Added a non-visual accessible name, button role, keyboard focus, Enter/Space activation, and synchronized `aria-expanded` to the mirrored mobile menu control.
- [x] Production keyboard evidence for commit `7e4f1d6e`: `false -> true -> false`, menu body state `closed -> open -> closed`, zero console errors.
- [ ] Vercel environment audit confirms all five release variables are Production-only. Preview needs approved secret isolation/protection before values are added.

## 2026-07-19 - About Us Manual Content Review

- [x] Audited the rendered About page before editing and identified three distinct WordPress capability panels carrying duplicated copy.
- [x] Manually edited only that capability section in the captured About HTML; no batch content transformer was used.
- [x] Assigned distinct Resident Experience, Security Operations and Facility Management copy to the three existing panels.
- [x] Preserved the original panel containers, illustrations, icons, animation hooks, order and responsive styling.
- [ ] Owner visual and editorial approval of this About section remains open.
- [ ] Audit the next visible About section before making further edits.

## 2026-07-21 - About Us Role Summary Section

- [x] Audited the role-summary section independently before editing it.
- [x] Removed unsupported customer-adoption and partner-delivery claims.
- [x] Replaced abstract repeated benefits with distinct resident, guard and facility-team responsibilities backed by the implemented product.
- [x] Manually edited only the six text nodes in this section; its image, icons, layout, spacing and animation markup remain unchanged.
- [ ] Owner visual and editorial approval of this section remains open.
- [ ] Audit the next visible About section before making further edits.

## 2026-07-21 - About Us Configured Services Section

- [x] Audited the configured-services section independently, including its `/contact-us/` CTA destination.
- [x] Removed universal claims about fees, utilities, insurance, stored funds, receipts, airtime and data.
- [x] Replaced them with provider-catalog and community-configuration-qualified wording.
- [x] Manually edited only the subtitle, heading, paragraph and CTA label; artwork, layout, destination and animation markup remain unchanged.
- [ ] Owner visual and editorial approval of this section remains open.
- [ ] Audit the next visible About section before making further edits.

## 2026-07-21 - About Us Security Section

- [x] Audited all four security cards and their associated badge assets before editing.
- [x] Removed unsupported ISO 27001, ISO 27701 and SOC 2 certification claims plus the overbroad live-monitoring claim.
- [x] Replaced them with role-aware access, community-boundary, scoped-visibility and accountable-record wording grounded in the implemented platform.
- [x] Hid the four inherited certification/security badge images while preserving their widget dimensions so the original card geometry does not collapse.
- [x] Manually edited only this section; no route-wide content transformer was run.
- [ ] Owner visual and editorial approval of this section remains open.
- [ ] Audit the next visible About section before making further edits.

## 2026-07-21 - About Us Product Principles Section

- [x] Audited the four tab panels, review-card widgets, stock portraits and inherited Logoipsum controls before editing.
- [x] Removed the unsupported customer-testimonial framing and converted each panel into a distinct product principle.
- [x] Added separate Resident Clarity, Guard-Ready Speed, Accountable Management and Community-Scoped Access content.
- [x] Hid the unrelated stock portraits and Logoipsum SVGs while preserving their containers and the original tab/card interactions.
- [x] Added visible `Residents`, `Security`, `Management` and `Access` labels to the existing tab controls.
- [x] Manually edited only this section; no route-wide content transformer was run.
- [ ] Owner visual, tab-interaction and editorial approval of this section remains open.
- [ ] Audit the next visible About section before making further edits.

## 2026-07-21 - About Us Demo CTA Section

- [x] Audited the CTA heading, supporting paragraph, button label and `/contact-us/` destination independently.
- [x] Removed generic join-now, universal safety and easy-payment promises.
- [x] Reframed the CTA around reviewing community structure, role workflows, enabled modules, onboarding needs and desired operational outcomes.
- [x] Manually edited only three text nodes; the existing button, destination, background, layout and animation remain unchanged.
- [ ] Owner visual and editorial approval of this section remains open.
- [ ] Audit the next visible About section before making further edits.

## 2026-07-21 - About Us Rollout Benefits Section

- [x] Audited the final three-column About content block independently.
- [x] Removed the unsupported usage-based discount claim and broad everyone/everything promise.
- [x] Reframed the columns around rollout planning, connected role context and accountable operational progress.
- [x] Manually edited only the six text nodes; column layout, typography, hover behavior and responsive stacking remain unchanged.
- [ ] Owner visual and editorial approval of this section remains open.
- [ ] Complete the shared About footer/link audit separately before marking the route editorially complete.

## 2026-07-21 - About Us Footer and Link Audit

- [x] Audited all 32 footer anchors, headings and visible text values on the About snapshot.
- [x] Replaced the stale payment-platform positioning sentence.
- [x] Corrected duplicated About, public 404, unsupported Careers and dead contact/onboarding destinations with valid product routes.
- [x] Hid four unconfigured social links and the nonfunctional language selector while preserving their layout containers.
- [x] Manually edited only the About snapshot footer; no cross-route or batch content command was used.
- [ ] Owner visual and link approval of the About footer remains open.
- [ ] Apply the same audit manually when each remaining route reaches its footer review; do not assume copied snapshots remain aligned.

## 2026-07-21 - Our Products Introduction Section

- [x] Began the `/our-products/` editorial pass with an independent audit of the opening heading and paragraph.
- [x] Removed generic smart-solution, under-one-roof and mission-critical claims.
- [x] Replaced them with role-specific, shared-community-context and configurable-module wording grounded in the implemented product.
- [x] Manually edited only the introduction heading and paragraph; later metrics, carousel, selectors, FAQs, form and footer remain separate audit scopes.
- [ ] Owner visual and editorial approval of this section remains open.
- [ ] Audit the next Products section before making further edits.

## 2026-07-21 - Our Products Capability Panels

- [x] Audited the four capability panels directly in the approved WordPress-derived `/our-products/` markup.
- [x] Replaced vague metric-like language and the `Maintenace` typo with accurate resident, service, security and facility-management workflow labels.
- [x] Preserved the original Elementor panel hierarchy, classes, styling hooks and responsive behavior.
- [ ] Owner visual and editorial approval of the four panels remains open.
- [ ] Audit the next Products section before making further edits.

## 2026-07-21 - Our Products Role CTA

- [x] Audited the CTA immediately following the four capability panels as an independent scope.
- [x] Replaced the generic `Redefine Community living.` heading with role-specific platform positioning.
- [x] Preserved the original Elementor heading, button, animation and `/contact-us/` destination.
- [ ] Owner visual and editorial approval of this CTA remains open.
- [ ] Audit the product-selector section before making further edits.

## 2026-07-21 - Our Products Role Selector

- [x] Audited the four-item interactive selector and its paired hover images independently.
- [x] Replaced inherited Saliver service and career URLs with `/residents/`, `/security-guards/`, `/facility-managers/` and `/marketplace/`.
- [x] Replaced generic image alt text with role-specific descriptions while preserving the original hover interactions and image assets.
- [ ] Owner interaction and visual approval of the selector remains open.
- [ ] Audit the product carousel before making further edits.

## 2026-07-21 - Our Products Capability Carousel

- [x] Audited all six carousel cards, image labels, destinations and the trailing CTA independently.
- [x] Replaced the repeated resident description with capability-specific copy for residents, guards, facility managers, marketplace, communication and platform context.
- [x] Aligned the About card title with its destination and replaced inherited filename-based image labels.
- [x] Replaced the dead `#` CTA with a valid `/core-features/` destination while preserving the carousel settings and markup.
- [ ] Owner interaction, copy and visual approval of the carousel remains open.
- [ ] Audit the following marquee section before making further edits.

## 2026-07-21 - Our Products Marquee

- [x] Audited the animated marquee independently and confirmed its duplicate text nodes are required for the continuous loop.
- [x] Replaced generic smart-solutions wording with concise connected-community positioning in both animation copies.
- [x] Preserved the original marquee wrappers, classes, timing hooks and duplicate-node structure.
- [ ] Owner motion, copy and visual approval of the marquee remains open.
- [ ] Audit the following Products content section before making further edits.

## 2026-07-21 - Our Products FAQ

- [x] Audited all ten FAQ questions and answers across the four accordion groups.
- [x] Replaced inherited agency categories with Platform & Rollout, Experience & Payments, Roles & Integrations, and Features & Configuration.
- [x] Removed absolute efficiency claims and unsupported telecom, insurance and custom-integration claims.
- [x] Corrected malformed About wording and qualified configuration and integration availability against rollout scope.
- [x] Preserved every accordion item, target ID, icon, class and interaction hook.
- [ ] Owner copy and interaction approval of the FAQ remains open.
- [ ] Audit the following Products contact section before making further edits.

## 2026-07-21 - Our Products Contact Section

- [x] Audited the Products contact heading, supporting copy, fields, enquiry options and submit control independently.
- [x] Retained the existing form fields and reason options because they align with the server-mediated contact contract.
- [x] Replaced generic transformation and project wording with community-rollout language and normalized the submit label.
- [x] Preserved the Contact Form 7-derived classes, field names, icons and layout consumed by the static form bridge.
- [ ] SMTP-backed production delivery evidence remains required before the contact gate can pass.
- [ ] Owner copy, form-state and visual approval remains open.
- [ ] Audit the Products footer before making further edits.

## 2026-07-21 - Our Products Footer and Link Audit

- [x] Audited the Products footer positioning, navigation groups, social controls, utility links, legal links and language control independently.
- [x] Replaced stale payment-platform positioning and the duplicated About, public 404, unsupported Careers and dead `#` destinations.
- [x] Reorganized Product overview links around the four role experiences and Core Features.
- [x] Hid unconfigured social and language controls while preserving their widget and grid containers.
- [x] Manually edited only the Products snapshot footer; no cross-route content command was used.
- [ ] Owner visual and link approval of the Products footer remains open.
- [x] Removed the inherited placeholder telephone URI from the Products contact details and replaced it with the valid Contact-page destination.
- [ ] The Products route editorial pass is complete pending owner approval and SMTP-backed form evidence.

## 2026-07-21 - Our Products Contact Identity Closeout

- [x] Revisited the contact identity block after the footer audit exposed a placeholder `tel:12345678900` destination.
- [x] Replaced the fake telephone destination with `/contact-us/` and retained the original two-line layout.
- [x] Kept the visible email address unchanged because no replacement mailbox has been approved.
- [ ] Owner link approval and SMTP-backed form evidence remain open.
## 2026-07-21 - Residents Opening Capability Grid

- [x] Began the `/residents/` editorial pass with an independent audit of the opening heading and four capability cards.
- [x] Replaced inherited e-commerce and monetization language with configured marketplace and service workflows.
- [x] Differentiated the repeated fourth-card description, normalized real-time wording and added meaningful content-image labels.
- [x] Preserved the four-card Elementor hierarchy, decorative highlights, image assets and reveal animations.
- [ ] Owner visual and editorial approval of the opening grid remains open.
- [ ] Audit the following Residents marquee before making further edits.

## 2026-07-21 - Residents Opening Marquee

- [x] Audited the first Residents marquee independently and confirmed its three text copies are required for the continuous loop.
- [x] Replaced unsupported AI customer-service positioning with visitor access, community updates and everyday requests.
- [x] Preserved all three copies, decorative image nodes, wrappers and animation hooks.
- [ ] Owner motion, copy and visual approval of this marquee remains open.
- [ ] Audit the following Residents content section before making further edits; the separate lower marquee remains untouched.

## 2026-07-21 - Residents Core Features Grid

- [x] Audited the four-card Core Features section and its rollout CTA independently.
- [x] Replaced inherited search, commerce and location samples in Amenity Booking with community amenity and status examples.
- [x] Removed unsupported Jira, Google, Slack, Zoom and AI positioning from Visible Status while preserving icon footprints and card geometry.
- [x] Replaced automatic incident-channel claims with resident workflow status copy and corrected the rollout CTA destination.
- [x] Added meaningful labels to non-decorative content images without changing assets or animation hooks.
- [ ] Owner visual, copy and interaction approval of this section remains open.
- [ ] Audit the following Residents section before making further edits.

## 2026-07-21 - Residents Workflow Panels

- [x] Audited the two-row, four-panel resident workflow section independently.
- [x] Retained the supported payments, complaints, community information, and notices content because it matches implemented resident workflows.
- [x] Normalized the complaints label, removed vague operational-history wording and added distinct accessibility labels to each screenshot instance.
- [x] Preserved the original two-column structure, duplicated visual assets, icon boxes and responsive behavior.
- [ ] Owner visual and editorial approval of these panels remains open.
- [ ] Audit the following Residents connected-workflows tab section before making further edits.

## 2026-07-21 - Residents Connected-Workflows Tabs

- [x] Audited the heading, supporting paragraph, three tab labels and three tab images independently.
- [x] Removed generic SaaS framing and unsupported drag-and-drop builder, automated-assignment, conditional-trigger and API-integration claims.
- [x] Replaced them with community-scoped records, focused resident actions and visible workflow status positioning.
- [x] Retained the three accurate tab labels and added a distinct accessibility label to each tab image.
- [x] Preserved all tab target IDs, active-state classes, animation hooks and image assets.
- [ ] Owner tab interaction, copy and visual approval remains open.
- [ ] Audit the following Residents section before making further edits.

## 2026-07-21 - Residents Profile Summary

- [x] Audited the Personal Hub, visitor-pass verification and connected-experience summary immediately following the tabs.
- [x] Replaced the mismatched catalog-policy description with resident profile activity context.
- [x] Removed the empty self-reloading link from the summary count and hid inherited stock portraits while retaining their layout footprint.
- [x] Preserved the section columns, icons, classes and reveal animations.
- [ ] Owner visual and editorial approval of this summary remains open.
- [ ] Audit the following Residents benefits section before making further edits.

## 2026-07-21 - Residents Benefits Section

- [x] Audited the benefits heading, six benefit points, central imagery and rollout link independently.
- [x] Replaced the malformed `most experienced thing` heading with resident-task positioning.
- [x] Differentiated repeated benefit statements across role access, search, status, visitor workflows, navigation and ownership.
- [x] Added meaningful labels to the two central images and removed a stale WordPress link-error marker.
- [x] Preserved all three columns, icon widgets, image assets and staggered reveal timing.
- [ ] Owner visual and editorial approval of this section remains open.
- [ ] Audit the lower Residents marquee before making further edits.

## 2026-07-21 - Residents Lower Marquee

- [x] Audited the lower Residents marquee independently and confirmed its three text nodes form one continuous loop.
- [x] Replaced the remaining inherited AI customer-service claim with resident-app, community-access and everyday-operations positioning.
- [x] Preserved all three text copies, decorative image nodes, wrappers and animation hooks.
- [ ] Owner motion, copy and visual approval remains open.
- [ ] Audit the following Residents section before making further edits.

## 2026-07-21 - Residents Product Carousel

- [x] Audited all six image-only carousel slides, image labels and overlay destinations independently.
- [x] Replaced inherited Saliver portfolio case-study URLs with Residents, Security Guards, Facility Managers, Marketplace, Core Features and About routes.
- [x] Replaced filename-based image labels with destination-specific Casa Nirvana descriptions.
- [x] Preserved carousel autoplay, loop, responsive slide counts, spacing, images and overlay controls.
- [ ] Owner carousel interaction and visual approval remains open.
- [ ] Audit the following Residents overview section before making further edits.

## 2026-07-21 - Residents Overview Section

- [x] Audited the two-column overview, supporting cards, imagery and demo CTA independently.
- [x] Removed unsupported automation-builder, assignment, trigger and API-integration claims.
- [x] Replaced repeated generic card descriptions with notices/communication and community-scope explanations.
- [x] Added meaningful image labels and connected the dead demo CTA to `/contact-us/`.
- [x] Preserved the original columns, image layering, icon cards and animation hooks.
- [ ] Include this section in the consolidated Residents owner verification pass.
- [ ] Continue with the Residents download section independently.

## 2026-07-21 - Residents Download Panel

- [x] Audited the download label, revenue-strategy heading and QR asset independently.
- [x] Removed the unsupported scan/download implication because no approved store destination or verified QR target is available.
- [x] Replaced inherited revenue language with resident-experience rollout positioning.
- [x] Hid the unverified QR while preserving its image container and section geometry.
- [ ] Approved App Store and Google Play destinations remain a future release input.
- [ ] Include this section in the consolidated Residents owner verification pass.
- [ ] Continue with the following Residents rollout CTA independently.

## 2026-07-21 - Residents Rollout CTA

- [x] Audited the post-download rollout CTA independently.
- [x] Retained the accurate resident-tools heading and original CTA styling.
- [x] Replaced the dead `#` documentation control with `Plan your rollout` linked to `/contact-us/`.
- [ ] Include this section in the consolidated Residents owner verification pass.
- [ ] Continue with the Residents contact section independently.

- [x] Added the missing accessibility label to the CTA's full-width resident-app image during route closeout.
- [x] Confirmed the route proceeds from this CTA directly to the footer; there is no separate Residents contact-form section.
- [ ] Include the complete CTA in the consolidated Residents owner verification pass.
## 2026-07-21 - Residents Footer and Route Closeout

- [x] Audited the Residents footer positioning, navigation groups, utility links, legal links, social controls and language widgets.
- [x] Replaced stale payment-platform positioning, duplicate About, public 404, unsupported Careers and dead `#` destinations.
- [x] Reorganized Product overview around Residents, Security Guards, Facility Managers, Marketplace and Core Features.
- [x] Hid unconfigured social profiles and both fake language controls while preserving their widget footprints.
- [x] Completed all known Residents sections using isolated audits, builds and commits.
- [ ] Owner consolidated visual, interaction and copy verification of `/residents/` remains open.
- [ ] App Store and Google Play destinations remain pending before download controls can be enabled.

## 2026-07-21 - Security Guards Opening Capability Grid

- [x] Began the `/security-guards/` editorial pass with an independent audit of the opening heading and four capability cards.
- [x] Replaced inherited hub, asset and e-commerce language with assigned guard, visitor verification, operational decision and handover positioning.
- [x] Differentiated the repeated fourth card and added meaningful accessibility labels to all four content images.
- [x] Preserved the four-card Elementor hierarchy, decorative highlights, image assets and reveal animations.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the first Security Guards marquee independently.

## 2026-07-21 - Security Guards Opening Marquee

- [x] Audited the first Security Guards marquee independently and retained the three copies required by its continuous loop.
- [x] Replaced unsupported AI customer-service wording with gate verification, incident reporting and shift-handover positioning.
- [x] Preserved every decorative image node, wrapper and animation hook.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the Security Guards Core Features grid independently.

## 2026-07-21 - Security Guards Core Features Grid

- [x] Audited the four Core Features cards, their sample data, status row, imagery and rollout CTA independently.
- [x] Removed inherited multi-cloud, browser, commerce, city and third-party integration claims.
- [x] Replaced repeated Entry status headings and demo values with visitor, entry, assigned-access and guard-status content.
- [x] Hid obsolete integration glyphs while preserving their layout footprint and added meaningful labels to content images.
- [x] Preserved the four-card structure, icons, image assets, CTA and animation hooks.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the Security Guards workflow panels independently.

## 2026-07-21 - Residents QR and Footer Brand Row Correction

- [x] Confirmed the Residents experience heading already matches the approved concise wording.
- [x] Restored the shared Casa Nirvana QR asset used by the homepage and role-experience panels.
- [x] Replaced the long footer positioning sentence with the compact `Community life, connected.` line.
- [x] Restored the four social glyphs as visible, non-navigating placeholders; approved profile URLs remain required before links are enabled.
- [x] Preserved the WordPress-derived QR panel, footer columns, logo placement and icon geometry.
- [ ] Owner visual approval of the corrected Residents QR and footer brand row remains open.

## 2026-07-21 - Residents Footer Logo Restoration

- [x] Compared the live Residents and homepage footer DOM in the Codex browser.
- [x] Confirmed the Residents export was missing the homepage's logo widget rather than merely hiding it through overflow.
- [x] Restored the same `pxl_logo` widget, Casa Nirvana logo asset and column position used by the approved homepage footer.
- [x] Added a meaningful logo label and retained the compact footer copy and visible social placeholders.
- [ ] Owner visual approval of the complete Residents footer brand row remains open.
- [ ] Apply this verified compact footer pattern during each remaining route-specific footer pass; do not change the homepage footer.

## 2026-07-21 - Footer Logo Size Standard

- [x] Measured the approved homepage footer wordmark at `132 × 32px` in the live Codex browser.
- [x] Constrained the Residents footer logo to the same width, height, containment and left alignment so the complete wordmark remains visible.
- [x] Recorded `132 × 32px` as the required footer-logo size for every remaining route; the homepage remains unchanged.
- [ ] Owner visual approval of the corrected Residents wordmark remains open after deployment.

## 2026-07-21 - Security Guards Workflow Panels

- [x] Audited the four panels across the mirrored two-row workflow layout.
- [x] Differentiated Resident Directory, Visitor and Entry Controls, Incident Reporting, and Notifications and Shift Handover.
- [x] Corrected the paused description-order defect before publishing so every panel maps to its intended guard workflow.
- [x] Added distinct accessibility labels to both repeated visual assets while preserving the source images and responsive structure.
- [ ] Include these panels in the consolidated Security Guards owner verification pass.
- [ ] Continue with the connected-workflows tab section independently.

## 2026-07-21 - Security Guards Connected-Workflows Tabs

- [x] Audited the section heading, supporting paragraph, three tab labels and three tab screenshots independently.
- [x] Removed inherited SaaS collaboration language and unsupported automation-builder, assignment, trigger and API-integration claims.
- [x] Retained the accurate Community-scoped Records, Focused Mobile Workflows, and Clear Status and Ownership tabs.
- [x] Added distinct screenshot labels while preserving all tab targets, active states, decorative highlights and animation hooks.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the post-tab profile summary independently.

## 2026-07-21 - Security Guards Profile Summary

- [x] Audited the two profile-summary cards, connected-experience count, inherited portraits and link behavior independently.
- [x] Replaced the mismatched Resident Directory heading with Assigned Guard Tools while retaining the accurate visitor-pass card.
- [x] Removed the empty self-link from the count and explicitly hid inherited stock portraits while preserving their footprint.
- [x] Preserved the section columns, icons, copy and reveal animations.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the Security Guards benefits section independently.

## 2026-07-21 - Security Guards Benefits Section

- [x] Audited the benefits heading, six guard statements, central imagery and rollout link independently.
- [x] Retained all six distinct, implementation-backed guard benefits.
- [x] Replaced the malformed inherited heading, labeled both content images and removed the stale WordPress link-error marker.
- [x] Preserved the three-column layout, icon widgets, image assets and staggered reveal timing.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the lower Security Guards marquee independently.

## 2026-07-21 - Security Guards Lower Marquee

- [x] Audited the separate lower marquee and retained all three nodes required by its continuous animation.
- [x] Replaced the remaining inherited AI customer-service phrase with guard-app, gate-access and operational-handover positioning.
- [x] Preserved the exact wrappers, decorative image nodes and animation behavior.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the Security Guards product carousel independently.

## 2026-07-21 - Security Guards Product Carousel

- [x] Audited all six image-only slides, overlay controls, destinations and image labels independently.
- [x] Replaced all inherited portfolio case-study URLs with Residents, Security Guards, Facility Managers, Marketplace, Core Features and About routes.
- [x] Updated both destinations per slide and replaced filename-based labels with route-specific Casa Nirvana descriptions.
- [x] Preserved carousel autoplay, loop, responsive slide counts, spacing, imagery and overlays.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the Security Guards overview section independently.

## 2026-07-21 - Security Guards Overview Section

- [x] Audited the layered overview, supporting cards, imagery and demo CTA independently.
- [x] Removed unsupported automation-builder, assignment, trigger and API-integration claims.
- [x] Differentiated notification and community-scope descriptions, labeled all content images and connected the demo CTA to Contact.
- [x] Preserved the original columns, image layering, icon cards and animation hooks.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the Guard experience QR panel independently.

## 2026-07-21 - Security Guards Experience QR Panel

- [x] Audited the panel label, highlighted heading, shared QR asset and live dimensions independently.
- [x] Replaced the inherited scan/download claim and revenue-strategy wording with concise Guard experience rollout copy.
- [x] Retained the visible `158 × 158px` QR treatment used across the approved marketing design and added an accessibility label.
- [x] Preserved the highlighted heading nodes, QR container and section geometry.
- [ ] Include this panel in the consolidated Security Guards owner verification pass.
- [ ] Continue with the Security Guards rollout CTA independently.

## 2026-07-21 - Security Guards Rollout CTA

- [x] Audited the accurate guard-tools heading, CTA destination, control label and full-width image independently.
- [x] Replaced the dead documentation control with `Plan your rollout` linked to `/contact-us/`.
- [x] Added a guard-experience label to the CTA image while preserving its asset and reveal treatment.
- [x] Preserved the original CTA layout, styling and animation.
- [ ] Include this CTA in the consolidated Security Guards owner verification pass.
- [ ] Continue with the Security Guards footer and route closeout.

## 2026-07-22 - Security Guards Footer and Route Closeout

- [x] Audited the footer positioning, logo, navigation groups, utility links, legal links, social controls and language widgets.
- [x] Added the complete Casa Nirvana wordmark at the approved homepage footer size of `132 × 32px`.
- [x] Replaced the long demo positioning statement with `Community life, connected.` and retained visible, non-navigating social glyphs.
- [x] Removed the duplicate About destination, public 404, unsupported Careers links, dead utility destinations and stale WordPress link-error markers.
- [x] Reorganized Product Overview around Residents, Security Guards, Facility Managers, Marketplace and Core Features.
- [x] Corrected every footer destination by matching its visible label to its own anchor and hid both fake language controls without removing their layout footprints.
- [x] Completed all known Security Guards sections through isolated audits and direct section edits.
- [ ] Owner consolidated visual, interaction and copy verification of `/security-guards/` remains open.

## 2026-07-22 - Security Guards Route Session Summary

- [x] Completed the overview, Guard experience QR panel, rollout CTA and standardized footer closeout.
- [x] Preserved the approved WordPress-derived layouts, decorative elements, images and animation hooks throughout the closeout.
- [x] Kept the shared QR asset visible and matched the footer wordmark to the homepage dimensions.
- [ ] Continue with `/facility-managers/` after owner verification of the completed Security Guards route.

### 2026-07-22 - Facility Managers route editorial completion

- Status: Implementation complete; pending owner visual verification.
- Completed the audited Facility Managers route section by section without changing the WordPress-derived hierarchy, classes, animation hooks, or responsive structure.
- Replaced inherited Saliver/demo language across the capability grid, operational workflows, tabs, benefits, marquee, overview, QR panel, and final CTA with supported Casa Nirvana facility-management copy.
- Replaced dead portfolio/demo destinations with valid Casa Nirvana routes and added meaningful media labels where the exported content required them.
- Standardized the non-homepage footer with the 132 x 32 Casa Nirvana wordmark, compact copy, non-navigating social glyphs, hidden placeholder language controls, and valid product/legal navigation.
- Preserved the visible QR treatment and the original Elementor layout/animation behavior.
- Acceptance evidence: `npm run build` passed in `apps/marketing-web` on Next.js 16.2.10; 22 static pages generated successfully.
- Remaining evidence: owner desktop/mobile visual signoff and approved QR destination confirmation.

### 2026-07-22 - Marketplace route editorial completion

- Status: Implementation complete; pending owner visual verification.
- Completed the Marketplace route section by section without changing the WordPress-derived hierarchy, Elementor identifiers, animation hooks, assets, or responsive structure.
- Replaced inherited SaaS, payment-platform, collaboration and third-party integration language across the opening journey, feature grid, administrative workflows, tabs, benefits, marquees, overview, QR panel and rollout CTA.
- Differentiated product discovery, cart and fulfilment, authenticated access, order visibility, catalog configuration, order oversight and marketplace policy content using supported Casa Nirvana workflows.
- Replaced dead portfolio/demo destinations with valid Casa Nirvana routes and added meaningful labels to key marketplace media.
- Standardized the non-homepage footer with the 132 x 32 Casa Nirvana wordmark, compact copy, non-navigating social glyphs, hidden placeholder language controls and valid product/legal navigation.
- Acceptance evidence: `npm run build` passed in `apps/marketing-web` on Next.js 16.2.10; 22 static pages generated successfully.
- Remaining evidence: owner desktop/mobile visual signoff and approved marketplace QR destination confirmation.

### 2026-07-22 - Marketplace deployment correction

- Corrected the non-homepage footer logo path from a missing WebP asset to the existing WordPress wordmark at `/assets/uploads/2025/02/logo-dark.png` on Facility Managers and Marketplace.
- Confirmed the missing asset caused `audit:snapshot` to fail, preventing Vercel from promoting the previous Marketplace commit and leaving the prior production deployment active.
- Added occurrence-aware Marketplace transform mappings so repeated WordPress widgets produce distinct titles and descriptions instead of three `Order status` cards and duplicated administration cards.
- Replaced inherited demo vendor/location labels with marketplace-specific terms in the committed snapshot and transform source of truth.
- Release evidence: transform syntax check passed; snapshot audit passed all 11 approved routes; Next.js production build generated all 22 pages successfully.

### 2026-07-22 - Pricing Plans route editorial completion

- Status: Implementation complete; pending owner visual verification.
- Audited both pricing scope templates and the comparison table before editing; preserved the WordPress-derived card, tab, table and responsive structure.
- Removed malformed numeric fragments, dollar signs and unsupported fixed-price claims. Pricing now remains explicitly contact-led through `Contact-led`, `Scoped quote` and `By agreement` labels.
- Replaced placeholder AI descriptions with distinct single-community, expanded-operations and multi-community rollout descriptions based on enabled modules, onboarding and agreed support.
- Routed all pricing-card actions to `/contact-us/` with truthful `Discuss your scope` states.
- Repaired corrupted comparison rows and replaced irrelevant project-management/analytics labels with configured payment visibility, onboarding, staged rollout, portfolio planning and support-model rows.
- Updated the pricing content transform to prevent overlapping numeric replacements and preserve distinct descriptions after future snapshot regeneration.
- Applied the standard non-homepage footer with the owned 132 x 32 wordmark, compact copy, valid navigation, non-navigating social glyphs and hidden placeholder language controls.
- Release evidence: transform syntax passed; snapshot audit passed all 11 approved routes; Next.js production build generated all 22 pages successfully.
- Remaining evidence: owner desktop/mobile visual signoff and final commercial wording approval.

### 2026-07-22 - Core Features route editorial completion

- Status: Implementation complete; pending owner visual verification.
- Audited and revised the Core Features route section by section while preserving its WordPress-derived hierarchy, Elementor classes, assets, animations and responsive behavior.
- Replaced inherited AI, SaaS, automation, Slack, deployment and revenue-strategy claims with implemented Casa Nirvana resident, guard, facility, marketplace, payment and community-scoped workflows.
- Differentiated repeated tab panels, lifecycle accordions, product-principle cards and rollout steps so each component communicates a distinct supported capability.
- Corrected integration language to reflect configured live availability and expanded the FAQ with truthful module and access-control answers.
- Updated occurrence-aware capture transforms so future WordPress extraction does not collapse repeated widgets back into duplicate content.
- Applied the standard non-homepage footer with the owned 132 x 32 wordmark, compact copy, non-navigating social glyphs, hidden placeholder language controls and valid navigation.
- Release evidence: transform syntax passed; snapshot audit passed all 11 approved routes; Next.js 16.2.10 production build generated all 22 pages successfully.
- Remaining evidence: owner desktop/mobile visual signoff.

### 2026-07-22 - Role-aware Get Started and onboarding separation

- Status: Implementation, deployment and functional verification complete; final brand, destination, delivery and owner parity gates remain open.
- Replaced the direct manager form at `/get-started/` with a resident-versus-community-team gateway and explicit guard provisioning guidance.
- Added `/get-started/residents/` with truthful new-user, existing-user, community search, unit selection, manual request and manager approval guidance based on the resident app implementation.
- Moved the manager request form to `/get-started/community/` and grouped role, identity, community and rollout qualification fields.
- Preserved the existing onboarding database schema by storing optional qualification data in the supported metadata record and exposed that context in the Superadmin review modal.
- Added explicit privacy/terms acknowledgement, duplicate-submit protection, request references and server-side metadata normalization.
- Kept Contact on its independent contact API and normalized Get Started versus Book a Demo destinations in the WordPress compatibility layer.
- Added validation coverage and sitemap entries for both audience-specific routes.
- Release evidence: transform syntax passed; snapshot audit passed all 11 configured routes; four marketing validation tests passed; the Next.js 16.2.10 build generated all 24 marketing routes; and the Superadmin build generated all 237 routes successfully under Node 22.
- Blocker: resident app public download/deep-link URL must be confirmed before the download action can be enabled.
- Blocker: applicant acknowledgement and internal notification email remain deferred until SMTP configuration and approved legal copy are available.
- Cache correction: versioned the WordPress compatibility form script across all 11 approved snapshots and the normalization source so immutable browser caching cannot retain stale CTA or Contact behavior.
- Production evidence: `casa-native-forms.js?v=20260722-onboarding` is live; Contact remains an enquiry form; generic, resident and manager Get Started actions resolve to their intended onboarding routes; and Book a Demo remains routed to Contact.
- Header and motion alignment: synchronized the shared Next.js header with the mirrored menu order, labels, Products dropdown and dual conversion actions; added staggered onboarding entrance, resident tab-panel, card, arrow and ambient hero motion with reduced-motion support.
- Production header evidence: at 1375px the shared header renders the mirrored 1300×66 shell, exact navigation order and dual actions without horizontal overflow; live computed styles confirm hero, content, form-shell and fieldset animation sequences.

### 2026-07-22 - Core Features how-it-works refinement

- Reworked the opening how-it-works content into a non-repetitive sequence: configure the community, invite authorized members and use role-focused tools.
- Updated both the committed snapshot and regeneration mapping while preserving the original card and accordion layout and animation behavior.

### 2026-07-22 - FAQs route editorial completion

- Status: Implementation complete; pending owner visual verification.
- Audited every FAQ group, answer, contact block and footer while preserving the WordPress-derived accordion, form, responsive and animation structure.
- Replaced inherited agency category labels with product-specific access, capability and operations groupings.
- Refined integration and operational-status answers to reflect configured availability and community-scoped access without unsupported guarantees.
- Corrected direct contact links to `hello@casanirvana.app` and removed the fake telephone destination.
- Applied the standard non-homepage footer with the owned 132 x 32 wordmark, compact copy, non-navigating social glyphs, hidden placeholder language controls and valid navigation.
- Synchronized regeneration mappings for category entities, revised answers and contact destinations.
- Release evidence: transform syntax passed; snapshot audit passed all 11 approved routes; Next.js 16.2.10 production build generated all 22 pages successfully.
- Remaining evidence: owner desktop/mobile visual signoff and production contact-form delivery after SMTP configuration.

### 2026-07-22 - FAQs capability-carousel correction

- Restored all six capability-card icons by replacing unavailable remote Saliver URLs with the existing mirrored SVG assets.
- Replaced repeated card descriptions with distinct visitor, resident, guard, facility, marketplace and community-operations content.
- Added descriptive icon alternative text and synchronized occurrence-aware regeneration mappings.

### 2026-07-22 - Contact Us route editorial completion

- Status: Implementation complete; pending owner visual verification and SMTP delivery evidence.
- Audited the form, direct-contact details, location embed and footer while preserving the WordPress-derived layout, responsive styling and form presentation.
- Retained the product-demo, community-onboarding, partnership and general-enquiry flow and made the message prompt community-specific.
- Corrected direct contact links to `hello@casanirvana.app` and removed the fake telephone destination.
- Replaced the inherited London Eye map with an Accra, Ghana embed and accurate accessibility labels.
- Applied the standard non-homepage footer with the owned 132 x 32 wordmark, compact copy, non-navigating social glyphs, hidden placeholder language controls and valid navigation.
- Synchronized the contact, map and form-copy regeneration mappings.
- Release evidence: transform syntax passed; snapshot audit passed all 11 approved routes; Next.js 16.2.10 production build generated all 22 pages successfully.
- Remaining evidence: owner desktop/mobile visual signoff and production contact-form delivery after SMTP configuration.

### 2026-07-22 - Privacy Policy implementation draft

- Status: Implementation complete; blocked from final approval pending legal and compliance review.
- Expanded the placeholder policy into an implementation-aligned notice covering scope, controller and processor roles, product and website data categories, purposes, sharing, international processing, retention, safeguards, data-subject rights, children's information and contact details.
- Corrected privacy and general contact addresses to the `casanirvana.app` domain in the legal page, fallback contact page and shared Next.js footer.
- Kept the draft label and explicit legal-review language so the page cannot be mistaken for approved launch copy.
- Grounded the compliance checklist in Ghana's Data Protection Act, 2012 (Act 843) and official Data Protection Commission guidance on transparency, data-subject rights, safeguards, retention and controller registration: [DPC organisations guidance](https://dataprotection.org.gh/for-organisations/), [DPC individual rights](https://dataprotection.org.gh/for-individuals/) and [Act 843](https://dataprotection.org.gh/wp-content/uploads/2025/05/Data-Protection-Act-2012-Act-843.pdf).
- Release evidence: snapshot audit passed all 11 approved routes; Next.js 16.2.10 production build generated all 22 pages successfully.
- Remaining evidence: counsel approval, confirmed controller/processor roles, approved processor and international-transfer disclosures, category-specific retention schedule, DPC registration/compliance evidence and owner visual signoff.

### 2026-07-22 - Terms of Service implementation draft

- Status: Implementation complete; blocked from final approval pending legal and commercial review.
- Expanded the placeholder terms to cover scope, authority, accounts, role-based access, community administration, visitor and security records, acceptable use, marketplace activity, payments, fees, user content, availability, suspension, privacy and change notices.
- Aligned payment language with the implemented hosted-provider model: Casa Nirvana records provider-returned status and does not equate checkout or payment status with seller or provider fulfilment.
- Kept liability, indemnity, governing law, venue, disputes, refunds and final termination procedures explicitly unresolved rather than publishing invented legal terms.
- Corrected the legal contact address to `legal@casanirvana.app` and retained the shared `.app` support address.
- Recorded official Bank of Ghana context for provider and consumer-recourse review: [Payment Systems and Services Act context](https://www.bog.gov.gh/notice/licensing-and-authorisation-of-payment-service-providers/), [approved providers](https://www.bog.gov.gh/news/list-of-approved-electronic-money-issuers-and-payment-service-providers/) and [consumer recourse guidance](https://www.bog.gov.gh/wp-content/uploads/2020/03/RECOURSE-MECHANISMS-FINAL-20-Feb-2017.pdf).
- Release evidence: snapshot audit passed all 11 approved routes; Next.js 16.2.10 production build generated all 22 pages successfully.
- Remaining evidence: counsel approval, confirmed contracting entity and eligibility, executed commercial schedules, cancellation and refund policy, provider terms, consumer recourse path, liability allocation, governing law, dispute process and owner visual signoff.

### 2026-07-22 - Approved-route production release audit

- Status: Content, build and production deployment corrections complete; pending owner viewport signoff.
- Audited all 13 approved production routes for page identity, stale external/demo references, placeholder links, loaded-image failures, form presence and browser warnings/errors.
- Confirmed every route has the expected title and H1, no loaded-image failures and no captured browser warnings or errors.
- Replaced the homepage's inherited `404` footer destination with Contact, corrected the remaining Products email to `hello@casanirvana.app`, and connected the Core Features, FAQs and Contact footer links to valid routes.
- Converted the Core Features `One` step marker from an empty anchor to a semantic non-interactive span without changing its class or layout styling.
- Synchronized the corrections in the capture transform so later WordPress snapshot regeneration cannot restore the defects.
- Preserved local Saliver compatibility assets because they are required by the approved mirrored visual system and are not remote theme dependencies.
- Release evidence: transform syntax passed; snapshot audit passed all 11 configured routes; Next.js 16.2.10 production build generated all 22 pages successfully under Node 22.
- Production evidence: commit `ce789406` was observed live at `casanirvana.app`; the corrected homepage, Products, Core Features, FAQs and Contact routes have no audited stale destinations, dead named links or broken loaded images.
- Remaining evidence: owner desktop/mobile visual signoff.

## 2026-07-22 - WordPress header parity correction

- [x] Replaced the onboarding-only custom header with the WordPress-derived dual header structure: black primary header, independently animated white sticky pill, and Saliver mobile navigation pattern.
- [x] Preserved the source 100px activation threshold, 0.6s cubic-bezier transition, 1300px shell, 40px radius, source logos, menu hierarchy, CTA styling, and sticky shadow.
- [x] Live production evidence on `/get-started/community/`: sticky state activates while scrolled, reverses at `scrollY: 0`, and produces zero horizontal overflow.
- [x] Verification evidence: snapshot audit passed for 11 routes; 4 form tests passed; Next.js production build generated 24 routes.
- [ ] Mobile viewport visual parity remains part of the systematic route-by-route viewport signoff.
- Commits: `3376a89d`, `2e7e3797`.

## 2026-07-22 - Exact approved header source reuse

- [x] Superseded the manually transcribed onboarding header with the literal header extracted from the immutable approved homepage snapshot.
- [x] Reused the original Elementor template 1318 CSS, Elementor Kit CSS, Saliver theme variables, theme/plugin stylesheets, desktop primary header, sticky header and mobile markup.
- [x] Limited intentional changes to four CTA destinations and client-side wiring for sticky/mobile behavior.
- [x] Production comparison at 1375x938 confirmed matching menu typography, shell geometry, CTA dimensions/colors/radii, the original sticky transition and zero horizontal overflow.
- [ ] Mobile viewport visual parity remains open for systematic route signoff.
- Commits: `80d424ae`, `748779f7`, `c9571282`, `c4a47662`.

## 2026-07-22 - Primary header clipping correction

- [x] Removed the zero-height Saliver wrapper that clipped the absolute primary header while leaving the fixed sticky header visible.
- [x] Preserved horizontal gutter containment and restored the original Saliver header body-state initialization.
- [x] Production evidence: primary menu visible at `scrollY: 0`; sticky menu hidden at top and visible after scrolling; both menus retain 66px line height and zero horizontal overflow.
- Commits: `a12d7331`, `0cafb31b`, `03245257`.

## 2026-07-22 - Onboarding six-viewport parity checkpoint

- [x] Audited `/get-started/`, `/get-started/residents/` and `/get-started/community/` at 1440x900, 1280x800, 1024x768, 768x1024, 390x844 and 360x800.
- [x] Confirmed zero horizontal overflow at every audited viewport and the intended desktop-to-mobile header switch between 1280px and 1024px.
- [x] Confirmed the gateway cards, resident tabs and four-step guidance, and community form fieldsets stack without clipping at tablet and mobile widths.
- [x] Verified the 390px mobile menu open/close behavior, backdrop, body scroll lock and accessible expanded state.
- [x] Verified both resident onboarding tab states and their distinct guidance.
- [x] Verified empty community-form submission remains client-side, exposes inline accessible errors for every required field and consent, and transmits no data.
- [x] Added and deployed a narrow desktop compatibility rule for 1201-1350px so the approved primary and sticky headers remain on one row without changing the mobile breakpoint.
- [x] Fresh production responses and a fresh Codex browser document reference `saliver-child/style.css?ver=7.0.3`; at 1280px the language control is hidden, the primary header is 66px high and horizontal overflow is zero.
- [ ] Replace the current Saliver artwork used by header/footer logo assets with an approved Casa Nirvana wordmark. Earlier tracker references to an "owned Casa Nirvana wordmark" describe the intended placement and size, not the artwork currently rendered.
- [ ] Confirm and configure the public resident app download/deep-link destination.
- [ ] Add and verify applicant/internal email delivery after SMTP details are supplied; SMTP is intentionally deferred and does not block the current visual pass.
- [ ] Record owner visual signoff for the three onboarding routes after the approved brand asset is installed.
- Evidence commits: `0251c0ac`, `45d6c865`.
