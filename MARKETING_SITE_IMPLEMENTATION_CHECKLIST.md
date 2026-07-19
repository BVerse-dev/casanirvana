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
