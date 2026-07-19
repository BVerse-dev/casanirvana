# Casa Nirvana Marketing Manual Acceptance Checklist

**Status:** NOT RUN  
**Created:** 2026-07-19  
**WordPress reference:** `http://localhost:8882`  
**Next.js candidate:** `http://localhost:3001`  

## Acceptance Rules

- Use Chrome or Safari while both local sites are running.
- Do not mark a route `PASS` because it looks close. Compare section position, text wrapping, section height, stacking, image crop, navigation state, animation and form state.
- Status values are `NOT RUN`, `PASS`, `FAIL`, or `APPROVED DIFFERENCE`.
- Every `PASS` or `APPROVED DIFFERENCE` requires a dated screenshot or recording reference.
- Record approved differences with owner, reason and date.
- Do not expose secrets, authenticated dashboards, personal data or production credentials in evidence.

## Evidence Naming

Use: `marketing-parity/<route>/<viewport>-wordpress.png` and `marketing-parity/<route>/<viewport>-nextjs.png`.

Example: `marketing-parity/residents/390x844-nextjs.png`.

## Route and Viewport Matrix

| Route | 1440x900 | 1280x800 | 1024x768 | 768x1024 | 390x844 | 360x800 | Owner | Evidence / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Owner | |
| `/about-us/` | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Owner | |
| `/our-products/` | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Owner | |
| `/residents/` | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Owner | |
| `/security-guards/` | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Owner | |
| `/facility-managers/` | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Owner | |
| `/marketplace/` | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Owner | |
| `/pricing-plans/` | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Owner | |
| `/core-features/` | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Owner | |
| `/faqs/` | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Owner | |
| `/contact-us/` | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Owner | |

## Shared Visual and Interaction Checks

| Check | Status | Evidence / notes |
| --- | --- | --- |
| Desktop header dimensions, logo, menu order and sticky behavior match the WordPress reference | NOT RUN | |
| Mobile menu opens, traps attention appropriately, exposes all approved routes and closes reliably | NOT RUN | |
| Footer layout, typography, links and responsive stacking match | NOT RUN | |
| No Saliver, Bravis, grazing, demo-shop, fake metric or unrelated project content is visible | NOT RUN | |
| Buttons, cards, carousels, tabs, accordions and hover/focus states remain visually consistent | NOT RUN | |
| Images preserve expected crop, aspect ratio and responsive placement | NOT RUN | |
| Animations preserve expected timing when motion is allowed | NOT RUN | |
| Reduced-motion mode removes nonessential movement without hiding content | NOT RUN | |
| No horizontal overflow at 390x844 or 360x800 | NOT RUN | |
| Browser console has no application errors or failed first-party assets | NOT RUN | |
| Unknown and excluded demo routes return 404 or the approved permanent redirect | NOT RUN | |

## Keyboard and Assistive Technology Checks

| Check | Status | Evidence / notes |
| --- | --- | --- |
| Skip link appears on keyboard focus and reaches the main content target | NOT RUN | |
| Every interactive control is reachable in a logical tab order | NOT RUN | |
| Focus remains clearly visible against light, dark and image backgrounds | NOT RUN | |
| Navigation, accordions, carousels and forms work without a pointer | NOT RUN | |
| No keyboard trap exists in desktop or mobile navigation | NOT RUN | |
| Form fields expose understandable names, requirements and errors | NOT RUN | |
| Success, pending, unavailable and failure messages are announced appropriately | NOT RUN | |
| Decorative images are ignored and meaningful images have useful alternatives | NOT RUN | |
| VoiceOver or another screen reader announces headings and landmarks in a useful order | NOT RUN | |

## Forms and Backend Acceptance

| Flow | Expected result | Status | Evidence / notes |
| --- | --- | --- | --- |
| Home email CTA | Routes to `/get-started/?email=...` with email prefilled | NOT RUN | |
| Onboarding valid submission | Returns normalized success and creates one pending onboarding request | PASS - prior controlled evidence | Row `d93641bd-48b3-4d38-8ddb-8ed305ec8c36`; cleanup decision remains open |
| Onboarding invalid submission | Shows field-level accessible validation without backend write | NOT RUN | |
| Onboarding duplicate click | Produces one request while pending | NOT RUN | |
| Contact valid submission | Returns normalized success and delivers one email | BLOCKED | SMTP password and delivery acceptance missing |
| Contact invalid submission | Shows field-level accessible validation without backend delivery | NOT RUN | |
| Contact backend unavailable | Shows truthful failure state and never false success | PASS - controlled API evidence | Normalized `503` behavior previously recorded |
| Honeypot submission | Returns non-revealing response without normal processing | NOT RUN | |

## SEO and Deployment Acceptance

| Check | Status | Evidence / notes |
| --- | --- | --- |
| Final production domain and `NEXT_PUBLIC_SITE_URL` are confirmed | PASS - owner confirmed | `https://casanirvana.app` |
| Every approved route has one title, description and canonical | PASS - static audit | `npm run audit:snapshot` |
| Open Graph and Twitter previews render correctly on deployed preview | NOT RUN | |
| Sitemap contains only approved indexable routes | PASS - implementation | Legal drafts intentionally excluded |
| Preview deployment sends `X-Robots-Tag: noindex, nofollow, noarchive` | NOT RUN | |
| Production robots and sitemap use the confirmed production origin | NOT RUN | |
| Lighthouse or equivalent reports no critical accessibility failure | NOT RUN | |
| LCP is at most 2.5 seconds, CLS at most 0.1 and INP at most 200 ms under representative production testing | NOT RUN | |
| Vercel production environment passes `npm run verify:release-env` | NOT RUN | |
| Backend health and both form proxies are reachable from deployment | NOT RUN | |

## Legal, Cutover, and Rollback

| Check | Status | Evidence / notes |
| --- | --- | --- |
| Privacy Policy receives explicit legal/owner approval and draft marker is removed | BLOCKED | |
| Terms of Service receives explicit legal/owner approval and draft marker is removed | BLOCKED | |
| WordPress Studio/export rollback artifact and location are recorded | NOT RUN | |
| Last-known-good Vercel deployment URL is recorded | NOT RUN | |
| DNS values and previous values are recorded before cutover | NOT RUN | |
| Rollback owner and decision window are recorded | NOT RUN | |
| WordPress remains available but non-public during the agreed rollback window | NOT RUN | |

## Signoff

| Role | Name | Decision | Date | Notes |
| --- | --- | --- | --- | --- |
| Product owner |  | NOT RUN |  | |
| Engineering |  | NOT RUN |  | |
| Legal/privacy |  | NOT RUN |  | |
| Release owner |  | NOT RUN |  | |
