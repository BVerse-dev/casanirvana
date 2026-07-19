# Casa Nirvana Marketing Site P0 Parity Matrix

## Status Key

- `PASS`: evidence recorded and acceptance criterion met.
- `OPEN`: implementation or verification remains.
- `BLOCKED`: verification cannot be completed in the current environment.
- `MISSING`: required launch route or artifact does not exist yet.

## Baseline

- WordPress source: `http://localhost:8882` while WordPress Studio is running.
- Next.js production preview: `http://localhost:3001`.
- Snapshot manifest: `apps/marketing-web/public/wordpress-snapshot/manifest.json`.
- Required viewports: 1440x900, 1280x800, 1024x768, 768x1024, 390x844, and 360x800.
- Visual standard: the approved WordPress/Saliver render, not an approximation.

## Route Matrix

| Route | Transport | 1440x900 | 1280x800 | 1024x768 | 768x1024 | 390x844 | 360x800 | Interactions | Runtime | Content | SEO | Final |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | PASS | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | OPEN | OPEN | OPEN | OPEN | OPEN |
| `/about-us/` | PASS | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | OPEN | OPEN | OPEN | OPEN | OPEN |
| `/our-products/` | PASS | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | OPEN | OPEN | OPEN | OPEN | OPEN |
| `/residents/` | PASS | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | OPEN | OPEN | OPEN | OPEN | OPEN |
| `/security-guards/` | PASS | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | OPEN | OPEN | OPEN | OPEN | OPEN |
| `/facility-managers/` | PASS | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | OPEN | OPEN | OPEN | OPEN | OPEN |
| `/marketplace/` | PASS | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | OPEN | OPEN | OPEN | OPEN | OPEN |
| `/pricing-plans/` | PASS | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | OPEN | OPEN | OPEN | OPEN | OPEN |
| `/faqs/` | PASS | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | OPEN | OPEN | OPEN | OPEN | OPEN |
| `/contact-us/` | PASS | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | OPEN | OPEN | OPEN | OPEN | OPEN |
| Privacy route | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |
| Terms route | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |

## 2026-07-19 Automated Evidence

### Home

- `PASS`: `GET /` returns HTTP 200.
- `PASS`: response size is 611,042 bytes.
- `PASS`: the Next.js response body is byte-identical to `public/wordpress-snapshot/pages/index.html`.
- `OPEN`: interactive navigation, sticky header, carousel, accordion, scroll effects, and animation behavior require browser evidence.
- `BLOCKED`: the Codex in-app browser reports both local ports as unreachable in this workspace, although the servers are reachable from the terminal and external browsers.

### Remaining captured P0 routes

- `PASS`: every captured P0 route returns direct HTTP 200 at its WordPress trailing-slash canonical URL.
- `PASS`: canonical P0 requests produce zero redirects after enabling the approved trailing-slash policy.

### Runtime inventory from Home

- `PASS`: repository normalization removed all literal and escaped `localhost:8882` references from all 107 documents.
- `PASS`: zero `/wp-admin`, `/wp-json`, `admin-ajax.php`, or `xmlrpc.php` references remain.
- `PASS`: authenticated WordPress admin-bar markup and inline admin-only styling are removed.
- `PASS`: Bertha editor styles, scripts, configuration, nonces, and authenticated user data are removed.
- `PASS`: Contact Form 7 JavaScript and REST configuration are removed.
- `OPEN`: Contact Form 7 CSS is intentionally retained for visual parity until native Next.js form behavior is connected.
- `PASS`: preserved full contact forms are bound to same-origin `POST /api/contact` with field mapping, honeypot forwarding, duplicate-submit prevention, accessible validation, and truthful status states.
- `PASS`: Home email-only calls-to-action hand off to `/get-started/` without fabricating required onboarding data, and the onboarding form pre-fills the supplied email.
- `PASS`: Home name/email subscription submits an explicit Casa Nirvana product-updates enquiry rather than pretending to be onboarding.
- `PASS`: onboarding delivery completed through Next.js, backend, and Supabase with HTTP 201; the synthetic pending row was verified by ID.
- `PASS`: unavailable backend connections now return normalized JSON HTTP 503 responses instead of uncaught empty HTTP 500 responses.
- `OPEN`: contact delivery returns normalized HTTP 503 because the encrypted SMTP password is not configured; host, sender, and username are present.
- `OPEN`: browser interaction states require visual evidence before final form signoff.
- `OPEN`: 57 WooCommerce references require a keep/remove decision based on the final launch route map.
- `PASS`: no captured asset failed during export.

## Active Blockers and Corrections

| Priority | Finding | Correction | Acceptance evidence |
|---|---|---|---|
| PASS | Escaped Studio URLs remained in captured HTML. | Added repository-only `prepare:snapshot` normalization without regenerating from WordPress. | Zero `localhost:8882` references across all 107 documents. |
| PASS | WordPress control-plane references remained. | Removed admin/editor/REST/AJAX/XML-RPC markup and dependencies while preserving public DOM/CSS behavior. | Zero static references across all 107 captured documents; browser network signoff remains part of visual QA. |
| PASS | Trailing-slash routes redirected once. | Aligned Next.js with the WordPress trailing-slash URL policy. | Direct HTTP 200 and zero redirects for every captured P0 canonical URL. |
| P0 | Automated visual evidence is unavailable in the Codex localhost browser. | Complete six-viewport review in Chrome/Safari or restore local access in the Codex browser. | Paired screenshots and signed differences for every P0 route. |
| P0 | Privacy and Terms routes are missing. | Create branded legal routes after approved legal content is available. | Both routes render, are linked, indexed appropriately, and pass review. |
| P1 | WordPress demo and WooCommerce runtime remains. | Decide keep/replace/redirect/remove after P0 parity approval. | Approved 107-route disposition table. |

## Home Manual Visual Signoff

| Viewport | Header/nav | Hero | Sections | Typography | Images | Footer | Motion | Overflow | Result | Reviewer/date |
|---|---|---|---|---|---|---|---|---|---|---|
| 1440x900 | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | |
| 1280x800 | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | |
| 1024x768 | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | |
| 768x1024 | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | |
| 390x844 | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | |
| 360x800 | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | |

## Completion Rule

A route moves to `PASS` only when transport, all six viewport comparisons, interactions, runtime independence, approved content, accessibility, and SEO have recorded evidence. Structural identity alone is not final parity approval.
