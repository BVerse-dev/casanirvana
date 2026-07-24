# Superadmin Launch Audit Checklist

## Operating rules

- Baseline: 241 filesystem routes discovered on 23 July 2026; active inventory is temporarily 250 while canonical Communities, Units, Residents and Guards routes coexist with compatibility redirects.
- The machine-readable source is `SUPERADMIN_ROUTE_MANIFEST.json`.
- Work in sidebar order and one vertical slice at a time.
- Mark a route complete only after backend/data, authorization, responsive, accessibility, build and production evidence is recorded.
- Preserve the current visual system; correct organization, truthfulness, usability, routing and security defects without redesigning the product.
- SMTP-dependent checks remain deferred until credentials are supplied.

## Phase sequence

- [x] Foundation: monorepo path reconciliation and initial 241-route inventory.
- [ ] Application shell and authentication/authorization boundary.
- [ ] Dashboards.
- [x] Community Management implementation and automated contract gates complete; authenticated production browser evidence remains tracked per route.
- [ ] People (Residents directory/lifecycle and Guards directory implementation complete; remaining People resources and production browser evidence remain open).
- [ ] Operations.
- [ ] Communication.
- [ ] Personal Hub.
- [ ] Notifications and Notices.
- [ ] Settings.
- [ ] Inherited, hidden and legacy routes.
- [ ] Phase 53 backend/database release hardening.
- [ ] Phase 54 Resident mobile launch audit.
- [ ] Phase 55 Guard mobile launch audit.

## Route ledger

| Route | Area | Menu | Disposition | Planned canonical route | Backend dependency | Database dependency | Role coverage | Status | Blockers | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/404-error` | 404-error | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/advanced-ul/alert` | advanced-ul | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/advanced-ul/ratings` | advanced-ul | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/advanced-ul/scrollbar` | advanced-ul | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/advanced-ul/swiper` | advanced-ul | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/advanced-ul/toastify` | advanced-ul | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agency/add` | agency | Yes | legacy_redirect | /agencies/add | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agency/add/fullform` | agency | No | legacy_redirect | /agencies/add/fullform | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agency/details` | agency | No | legacy_redirect | /agencies/details | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agency/documents` | agency | No | legacy_redirect | /agencies/documents | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agency/finance` | agency | No | legacy_redirect | /agencies/finance | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agency/grid-view` | agency | Yes | legacy_redirect | /agencies?view=grid | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agency/list-view` | agency | Yes | legacy_redirect | /agencies?view=list | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agency/manage` | agency | Yes | legacy_redirect | /agencies/manage | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agency/profiles` | agency | No | legacy_redirect | /agencies/profiles | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agency/services` | agency | No | legacy_redirect | /agencies/services | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agency/staff` | agency | No | legacy_redirect | /agencies/staff | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agents/add` | agents | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agents/details` | agents | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agents/grid-view` | agents | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/agents/list-view` | agents | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/amenities/add` | amenities | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/amenities/bookings` | amenities | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/amenities/bookings/:id` | amenities | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/amenities/details/:id` | amenities | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/amenities/list` | amenities | Yes | legacy_redirect | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/auth/lock-screen` | auth | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/auth/reset-password` | auth | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/auth/sign-in` | auth | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/auth/sign-up` | auth | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/accordion` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/alerts` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/avatar` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/badge` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/breadcrumb` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/buttons` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/cards` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/carousel` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/collapse` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/dropdown` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/list-group` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/modals` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/offcanvas` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/pagination` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/placeholders` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/popovers` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/progress` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/spinners` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/tabs` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/toasts` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/base-ui/tooltips` | base-ui | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/area` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/bar` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/boxplot` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/bubble` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/candlestick` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/column` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/heatmap` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/line` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/mixed` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/pie` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/polar` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/radar` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/radial-bar` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/scatter` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/timeline` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/charts/treemap` | charts | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/coming-soon` | coming-soon | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/communities/:id` | communities | No | product_audit | /communities | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/communities/:id/edit` | communities | No | product_audit | /communities | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/communities/add` | communities | Yes | product_audit | /communities | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/communities/details` | communities | No | product_audit | /communities | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/communities/grid` | communities | Yes | legacy_redirect | /communities?view=grid | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/communities/join-requests` | communities | Yes | product_audit | /communities | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/communities/list` | communities | Yes | legacy_redirect | /communities?view=list | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/complaints` | complaints | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/complaints/:id` | complaints | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/customers/add` | customers | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/customers/details` | customers | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/customers/grid-view` | customers | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/customers/list-view` | customers | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/dashboards/agent` | dashboards | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/dashboards/analytics` | dashboards | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/dashboards/customer` | dashboards | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/direct-api-test` | direct-api-test | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/emergency-alerts` | emergency-alerts | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/forms/basic` | forms | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/forms/checkbox` | forms | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/forms/clipboard` | forms | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/forms/editors` | forms | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/forms/file-uploads` | forms | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/forms/flat-picker` | forms | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/forms/input-mask` | forms | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/forms/range-slider` | forms | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/forms/select` | forms | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/forms/validation` | forms | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/forms/wizard` | forms | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/guards/add` | guards | Yes | product_audit | /guards | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/guards/assignments` | guards | No | product_audit | /guards | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/guards/details` | guards | No | product_audit | /guards | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/guards/equipment` | guards | No | product_audit | /guards | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/guards/grid-view` | guards | Yes | legacy_redirect | /guards?view=grid | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/guards/list-view` | guards | Yes | legacy_redirect | /guards?view=list | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/guards/manage` | guards | Yes | product_audit | /guards | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/guards/performance` | guards | No | product_audit | /guards | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/guards/profiles` | guards | No | product_audit | /guards | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/guards/schedules` | guards | No | product_audit | /guards | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/guards/training` | guards | No | product_audit | /guards | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/help-desk/inquiries` | help-desk | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/help-desk/inquiries/:id` | help-desk | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/icons/boxicons` | icons | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/icons/solaricons` | icons | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/inbox` | inbox | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/maintenance` | maintenance | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/maintenance-requests` | maintenance-requests | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/maintenance-requests/:id` | maintenance-requests | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/maps/google` | maps | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/maps/vector` | maps | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/messages` | messages | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/notifications/analytics` | notifications | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/notifications/campaigns` | notifications | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/notifications/dashboard` | notifications | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/notifications/email` | notifications | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/notifications/in-app` | notifications | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/notifications/push` | notifications | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/notifications/settings` | notifications | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/notifications/sms` | notifications | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/notifications/templates` | notifications | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/orders` | orders | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/pages/calendar` | pages | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/pages/error-404-alt` | pages | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/pages/faqs` | pages | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/pages/invoice` | pages | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/pages/pricing` | pages | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/pages/timeline` | pages | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/pages/welcome` | pages | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/payments` | payments | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/payments/charges` | payments | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/payments/details` | payments | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/payments/invoices` | payments | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/payments/payouts` | payments | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/personal-hub/airtime` | personal-hub | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/personal-hub/bills` | personal-hub | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/personal-hub/dashboard` | personal-hub | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/personal-hub/data` | personal-hub | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/personal-hub/insurance` | personal-hub | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/personal-hub/marketplace` | personal-hub | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/personal-hub/reports` | personal-hub | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/personal-hub/transfers` | personal-hub | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/post` | post | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/post/create` | post | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/post/details` | post | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/post/edit` | post | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/property/add` | property | Yes | legacy_redirect | /units/add | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/property/details` | property | No | legacy_redirect | /units/details | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/property/grid` | property | Yes | legacy_redirect | /units?view=grid | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/property/list` | property | Yes | legacy_redirect | /units?view=list | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/residents/add` | residents | Yes | product_audit | /residents | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/residents/details` | residents | No | product_audit | /residents | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/residents/edit` | residents | No | product_audit | /residents | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/residents/grid-view` | residents | Yes | legacy_redirect | /residents?view=grid | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/residents/list-view` | residents | Yes | legacy_redirect | /residents?view=list | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/reviews` | reviews | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/service-requests` | service-requests | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/service-requests/:id` | service-requests | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/services` | services | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/services/add` | services | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/services/details` | services | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/admin/onboarding` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/admin/roles` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/admin/security` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/admin/users` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/agencies` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/agencies/configuration` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/agencies/documents` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/agencies/finance` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/agencies/profiles` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/agencies/services` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/agencies/staff` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/app` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/app/extensions` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/app/onboarding` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/app/splash` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/app/urls` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/communities` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/communities/amenities` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/communities/configuration` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/communities/documents` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/communities/finance` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/communities/profiles` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/communities/services` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/communities/staff` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/communities/units` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/email/notifications` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/email/smtp` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/email/templates` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/general` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/general/application` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/general/business` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/general/integrations` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/general/regional` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/general/security` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/general/system` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/guards` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/guards/assignments` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/guards/configuration` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/guards/equipment` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/guards/performance` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/guards/profiles` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/guards/schedules` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/guards/training` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/language/default` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/language/localization` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/language/translations` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/module-settings` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/notifications/email` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/notifications/in-app` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/notifications/push` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/notifications/rules` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/notifications/sms` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/payment/fees` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/payment/gateways` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/payment/methods` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/system` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/system/overview` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/system/settings` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/users` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/users/activity` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/users/groups` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/users/permissions` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/users/preferences` | settings | Yes | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/users/profiles` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/settings/users/roles` | settings | No | product_audit | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/tables/basic` | tables | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/tables/gridjs` | tables | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/transactions` | transactions | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/visitors/add` | visitors | Yes | product_audit | /visitors | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/visitors/details` | visitors | No | product_audit | /visitors | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/visitors/grid-view` | visitors | Yes | legacy_redirect | /visitors?view=grid | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/visitors/list-view` | visitors | Yes | legacy_redirect | /visitors?view=list | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |
| `/widgets` | widgets | No | retire | - | TBD during page audit | TBD during page audit | platform, agency-scoped, community-scoped | not_started | - | - |

## Session history

### 2026-07-23 - Agency create/details/edit lifecycle slice

- Status: Implementation complete; automated evidence passed.
- Canonical routes: `/agencies/add`, `/agencies/{id}`, and `/agencies/{id}/edit`.
- Backend contracts: scoped directory create, summary read, and synchronized base/profile update through the shared authenticated backend client.
- Legacy compatibility: singular add/full-form/details routes permanently redirect to canonical plural routes.
- Data boundary: Agency identity/contact fields synchronize across base and profile records; managed communities remain in Community Management.
- Route inventory: temporarily 255 while canonical routes and legacy compatibility redirects coexist.
- Acceptance evidence: 9/9 Agency lifecycle, directory and route contracts passed; the mounted scoped base/profile synchronization test passed; API TypeScript build, Superadmin `build:check`, and standalone 244-page production build passed on 2026-07-23.

### 2026-07-23 - Agencies unified directory vertical slice

- Status: Implementation complete; automated evidence passed.
- Canonical route: `/agencies?view=grid|list`, with grid as the first-visit default and browser preference persistence.
- Legacy compatibility: `/agency/grid-view` and `/agency/list-view` permanently redirect to canonical view state.
- Backend contract: one scoped `GET /admin/agencies/directory` query supplies normalized search, status and pagination data to both views.
- Specialized boundary: `/agency/manage` and its capability-specific operational tabs remain available and unchanged.
- Route inventory: temporarily 252 while canonical routes and legacy compatibility redirects coexist.
- Acceptance evidence: 6/6 Agency directory and route contracts passed; the scoped mounted Agency directory test passed; API TypeScript build, Superadmin `build:check`, and standalone 243-page production build passed on 2026-07-23.

### 2026-07-23 - Guard details lifecycle vertical slice

- Status: Implementation complete; automated evidence passed.
- Canonical route: `/guards/{id}` with legacy `/guards/details?id=...` permanently redirected.
- Backend contracts: scoped Guard profile, assignment, schedule, equipment, performance and training reads through the shared authenticated backend client.
- Navigation: Guard cards, tables, legacy views and provisioning return to canonical Guard routes; assignment changes remain in `/guards/manage`.
- Deliberate boundary: no `/guards/{id}/edit` route is shipped because the backend currently has no scoped Guard profile update endpoint.
- Route inventory: temporarily 251 while canonical routes and legacy compatibility redirects coexist.
- Acceptance evidence: 9/9 Guard lifecycle, Guard directory and route contracts passed; the scoped mounted Guard profile test passed; API TypeScript build, Superadmin `build:check`, and the standalone 242-page production build passed on 2026-07-23.

### 2026-07-23 - Phase 52 foundation

- [x] Confirmed the active monorepo application root is `apps/superadmin`.
- [x] Confirmed root scripts, CI cache paths, split-repository prefixes and database-type synchronization use the new monorepo paths.
- [x] Generated the initial route, menu and internal-link manifest.
- [x] Added a route-contract test before canonical navigation changes.
- [x] Initial route-contract tests passed: 241 unique filesystem routes, 93 sidebar destinations and zero unresolved sidebar destinations. The active compatibility inventory is now 242 after adding canonical `/communities` without prematurely removing legacy redirects.
- [x] Strict `build:check` and the environment-gated production build passed under Next.js 14.2.6.
- [ ] Handle optional `sharp` installation and Browserslist database refresh in the dedicated dependency-security slice, not this routing foundation change.
- [ ] Begin the Application Shell slice after foundation verification is committed and deployed.
## Session Update - 2026-07-23 - Application Shell Reliability and Personal Notifications

- Status: Complete for this sub-slice; centralized route-policy enforcement and production browser evidence remain open in the Application Shell group.
- Replaced render-time authentication navigation with an effect-driven authenticated boundary and explicit loading/redirect states.
- Replaced the static template profile identity and broken profile/pricing/support links with the active session identity, dashboard, Casa Nirvana support, and a real NextAuth sign-out action.
- Replaced the hard-coded notification user and browser-side Supabase queries with authenticated backend endpoints that scope every read and update to `req.user.id`.
- Corrected the legacy join-request notification destination, rejected unsafe external action URLs, and added truthful loading, empty, and failure states.
- Corrected empty breadcrumb/footer destinations and added an application-level 404 route.
- Acceptance evidence: `personal-notifications.test.ts` 3/3 passed; API TypeScript build passed; Superadmin route-contract tests 3/3 passed; `build:check` passed; production build passed with 237 generated pages.
- Tracked debt: Next.js still reports the repository's existing skipped lint/type validation settings during production build; removal remains gated on tracked debt reaching zero.
## Session Update - 2026-07-23 - Central Route Policy and Forbidden State

- Status: Complete for capability-backed Guard and Agency route families; broader policy coverage remains gated on backend capability contracts for later menu groups.
- Added a centralized route-policy resolver for direct and nested Guard/Agency URLs, including tab-specific workspace capabilities and forward-compatible canonical `/agencies` paths.
- Added a stable route authorization boundary inside the authenticated application shell so unauthorized direct navigation renders a proper 403 state without removing navigation context.
- Added a fail-closed authorization-service state with explicit retry instead of rendering protected content when capability loading fails.
- Backend scope and permission middleware remain the security authority; this boundary provides defense-in-depth and consistent administrator UX.
- Acceptance evidence: route-policy tests 4/4 passed; route-contract tests 3/3 passed; `build:check` passed; standalone production build passed with 237 generated pages.
## Session Update - 2026-07-23 - Casa Nirvana Analytics Dashboard

- Status: Implementation complete; production browser evidence remains open.
- Audited every rendered dashboard component against `/admin/dashboard/analytics`, `/admin/payments/transactions`, and `/admin/payments/obligations`.
- Confirmed community, unit, resident, visitor, payment, and obligation reads are backend-scoped; no random metrics are rendered by the retained components.
- Removed the template property carousel, unsupported world map, equal-width distribution visualization, internal QA buttons, and misleading outstanding change calculation.
- Replaced unsupported visuals with scoped resident distribution percentages and real seven-day collection data while preserving the existing cards, charts, spacing, and responsive grid.
- Corrected period labels, currency context, truthful loading/error/empty states, and active workspace links.
- Acceptance evidence: dashboard contract tests 3/3 passed; scoped backend dashboard tests 6/6 passed; backend TypeScript build passed; route-contract tests 3/3 passed; Superadmin `build:check` and standalone production build passed with 237 generated pages. Analytics first-load JS decreased from approximately 387 kB to 332 kB.
## Session Update - 2026-07-23 - Residents Dashboard

- Status: Implementation complete for `/dashboards/agent`; canonical route rename and production browser evidence remain open.
- Reconciled the inherited route naming and confirmed `/dashboards/agent` is the Residents dashboard backed by `/admin/dashboard/residents`.
- Verified registration, occupancy, maintenance, satisfaction, engagement, response-time, community-distribution, and roster formulas against scoped backend records.
- Removed stock-person avatar substitution, unsupported “Featured” and “Goals” implications, and ambiguous revenue/obligation labels.
- Added initials-based resident fallbacks, roster API failure states, capped accessible collection progress, and grid-default workspace links.
- Acceptance evidence: Residents dashboard contract tests 3/3 passed; scoped backend dashboard tests 6/6 passed; backend TypeScript build passed; route-contract tests 3/3 passed; Superadmin `build:check` and standalone production build passed with 237 generated pages.

### 2026-07-23 - Guards dashboard vertical slice

- Status: Implementation complete; automated evidence passed.
- Route: `/dashboards/customer` (legacy route name retained until canonical dashboard routing work).
- Backend contract: `GET /admin/dashboard/guards` through the shared authenticated backend client.
- Data evidence: staffing, salary, performance, training, duty-hour and assignment values remain backend-owned and scoped by administrator access.
- Corrections: removed property/demo imagery, stock guard portraits, unsupported world map, stale detail/list links and dead layout space; added initials fallbacks, community coverage, and explicit error/empty states.
- Acceptance evidence: 3/3 guard dashboard contracts, 3/3 route contracts, 6/6 backend dashboard tests, backend TypeScript build, Superadmin `build:check`, and the standalone 237-page production build passed on 2026-07-23.

### 2026-07-23 - Communities unified directory vertical slice

- Status: Implementation complete; automated evidence passed.
- Canonical route: `/communities?view=grid|list`, with grid as the first-visit default and authenticated-browser preference persistence.
- Legacy compatibility: `/communities/grid` and `/communities/list` permanently redirect while preserving search parameters.
- Backend contract: one shared `GET /admin/communities` paginated query supplies both views; no database or API change was introduced.
- Corrections: removed duplicate sidebar destinations, template location filters, fake property-image fallbacks, query-string details links, duplicated requests and the nonfunctional grid-local view toggle.
- Acceptance evidence: 4/4 Communities directory contracts, 3/3 route contracts against 242 unique routes with zero unresolved sidebar destinations, Superadmin `build:check`, and standalone 238-page production build passed on 2026-07-23.

### 2026-07-23 - Communities visual-parity correction

- Status: Implementation complete; build evidence pending for this correction.
- Restored the approved image-backed Community cards, statistics row, filter sidebar, spacing and card actions that existed before route consolidation.
- Kept `/communities?view=grid|list`, canonical details links and the shared persisted view preference without introducing a replacement visual design.
- Delivery rule clarified: directory consolidation may change menu destinations, routing and shared state only; existing resource presentation remains unchanged unless separately approved.
- Production diagnosis: restored legacy requests used unsupported limits of `1000` and `9999`; both now use the backend-enforced maximum of `200`, preserving the approved UI while restoring data and view controls.
- List parity: `?view=list` now renders the approved full-width image-backed table with its own search, sorting, pagination and actions; the grid-only filter sidebar is not rendered in list mode.

### 2026-07-23 - Guards visual-parity correction

- Status: Implementation complete; build and production evidence pending.
- Restored the approved Guard directory overview, statistics composition and detailed grid cards while retaining canonical Guard routes and the shared grid/list toggle.
- Preserved live scoped Guard records and assignment status; no backend, database, global style or list-view change was introduced.
- Deployment dependency: the Render service must use the monorepo `apps/api` root so the deployed frontend and backend contracts remain synchronized.

### 2026-07-23 - Units unified directory vertical slice

- Status: Implementation complete; automated evidence passed.
- Canonical routes: `/units?view=grid|list`, `/units/add`, and `/units/{id}`.
- Legacy compatibility: `/property/grid`, `/property/list`, `/property/add`, and `/property/details?id=...` permanently redirect while preserving relevant state and identifiers.
- Backend contract: one shared `GET /admin/units` paginated query supplies both views; `GET /admin/units/{id}` supplies scoped details.
- Corrections: removed duplicate sidebar destinations, fake unit imagery/bookmarks, dollar formatting, disabled edit controls, external map embedding, duplicated requests and query-string detail navigation.
- Deliberate boundary: unit editing remains open until its complete validated update contract is implemented; no speculative partial form was shipped.
- Route inventory: temporarily 250 while canonical routes and legacy compatibility redirects coexist.
- Acceptance evidence: 5/5 Units directory contracts, 3/3 route contracts against 245 unique routes with zero unresolved sidebar destinations, Superadmin `build:check`, and standalone 240-page production build passed on 2026-07-23.

### 2026-07-23 - Units visual-parity correction

- Status: Implementation complete; build and production evidence pending.
- Restored the approved grid filter panel, image-backed Unit cards, statistics row and full-width image list from the pre-consolidation implementation.
- Retained `/units?view=grid|list`, canonical details/edit routes, live backend data and the shared persisted toggle.
- Removed the unsupported bookmark action, corrected currency to GH₵ and aligned full-directory reads with the backend maximum of 200 without changing the approved layout.

### 2026-07-23 - Community Join Requests vertical slice

- Status: Implementation complete; automated evidence passed.
- Route: `/communities/join-requests`.
- Backend contracts: scoped `GET /admin/join-requests` and `PATCH /admin/join-requests/{id}` through the shared authenticated backend client.
- Data behavior: backend-owned search, status filtering, pagination, community/unit/profile enrichment, reviewer stamping and scope enforcement.
- Corrections: removed the 1,000-row client-side filtering workaround, local pagination/count drift, completed-request actions and ambiguous rejection handling; added URL state, required rejection notes, review history and explicit failure/empty states.
- Acceptance evidence: 3/3 Join Request UI contracts, 7/7 focused backend community tests, 3/3 route contracts, Superadmin `build:check`, and standalone 240-page production build passed on 2026-07-23.

### 2026-07-23 - Community create/details/edit lifecycle slice

- Status: Implementation complete; automated evidence passed.
- Canonical routes: `/communities/add`, `/communities/{id}`, and `/communities/{id}/edit`; legacy `/communities/details?id=...` permanently redirects.
- Backend contracts: scoped `GET/POST/PUT /admin/communities` lifecycle through the shared authenticated client, plus backend-owned agency directory choices.
- Corrections: removed backward client redirect, unsupported photo upload, fabricated resident estimate, dollar labels, retired list navigation and silent edit-load failure; added scoped agency selection, canonical save/cancel routing, management payload fields and truthful details.
- Data boundary: details show backend-owned community, agency, unit-stat, occupancy, amenity and financial records only.
- Acceptance evidence: 3/3 Community lifecycle contracts, 7/7 focused backend community tests, 3/3 route contracts, Superadmin `build:check`, and standalone 240-page production build passed on 2026-07-23.

## Phase 52 Visual-Parity Recovery Track

- Rule: preserve canonical routes, live backend/database contracts, authorization, and unified grid/list state while restoring the approved pre-Phase 52 presentation. Demo values must not return; missing live values use truthful empty states.
- [x] Communities directory presentation restored without changing its canonical directory contract.
- [x] Units directory presentation restored without changing its canonical directory contract.
- [x] Guards directory presentation restored without changing its canonical directory contract.
- [x] Unit details presentation restored: image-led overview, owner card, specification strip, amenities, actions, and location panel now consume the existing live Unit record.
- [ ] Restore and sign off Unit create/edit presentation.
- [ ] Restore and sign off Community details/create/edit presentation.
- [ ] Restore and sign off Join Requests presentation.
- [ ] Restore and sign off Residents directory/details/create/edit presentation.
- [ ] Restore and sign off Guards details presentation.
- [ ] Restore and sign off Agencies directory/details/create/edit presentation.
- [ ] Restore and sign off Casa Nirvana, Residents, and Guards dashboard presentation.
- [ ] Record authenticated production browser evidence for every restored slice.

### 2026-07-23 - Unit details visual-parity recovery

- Restored the approved pre-consolidation Unit overview composition while retaining /units/{id}, /units/{id}/edit, backend-owned data, scoped authorization, and truthful missing-data states.
- No database schema, API contract, directory view-state, or mutation behavior changed in this slice.

### 2026-07-24 - Unit create/edit visual-parity recovery

- Preserved the approved image-preview card, two-column information form, amenities card and quick-action panel for both canonical Unit create and edit routes.
- Removed demo-era preview values and create defaults; the preview now reflects the selected live Community and current form values with truthful empty states.
- Retained scoped create/update mutations, live Community selection, edit hydration, validation and canonical post-save routing.

### 2026-07-24 - Superadmin expired-session recovery

- Confirmed from production backend logs that a refreshed page repeatedly sent an invalid Supabase access token and did not recover.
- Assigned Supabase refresh-token ownership exclusively to NextAuth by disabling browser-side persistence and automatic rotation for the shared Superadmin Supabase client.
- Added one deduplicated shared API recovery attempt on 401; a successfully refreshed token retries the original request once, while an unrecoverable session is cleared and redirected to sign-in instead of polling indefinitely.
- Protected queries now wait for an authenticated NextAuth session rather than running for unauthenticated state.

### 2026-07-24 - Resource create-action and Community details recovery

- Audited canonical Communities, Units, Residents, Guards, Agencies and both Visitor directory views for create actions. Units grid was the only missing resource action; it now exposes Add Unit and preserves the selected Community context.
- Replaced the non-product Unit tour form with a Community and occupancy panel that adapts to vacant/occupied status and links to canonical Community and Unit directories.
- Restored the approved Community image banner, scrollable details tabs, occupancy analytics, Unit and Resident records, financial cards, activity timeline and management panels using backend-owned records.
- Updated restored Community shortcuts from legacy /property routes to canonical /units routes and corrected financial formatting to Ghana cedi.

### 2026-07-24 - Community create/edit visual-parity recovery

- Preserved the approved two-column Community create/edit form and restored an image-led live preview card consistent with the Community directory and details pages.
- Removed demo-era initial values for Community type, year, Unit/floor/block counts and financial amounts so required operational data must be entered explicitly.
- Kept edit hydration, scoped Agency selection, validation, create/update mutations and canonical post-save routing intact.

### 2026-07-24 - Community Join Requests visual-parity recovery

- Restored the approved operational overview with exact backend counts for Pending, Manual Review, Approved and Rejected requests.
- Restored richer Resident request cards, Community/Unit context, message preview, status presentation and explicit review actions.
- Preserved server-side search, status filtering, pagination, scoped reads, detail review, approval/rejection confirmation and required rejection notes.
- Added a clear-filter action without introducing demo requests or client-only totals.
### 2026-07-24 - Residents directory visual-parity recovery

- Restored the approved resident portfolio overview and companion coverage cards to the canonical grid directory.
- Kept the canonical `/residents?view=grid|list` route, shared view preference, live server filtering, pagination, and mutations unchanged.
- Kept list mode as a full-width table and retained the original avatar-led resident cards in grid mode.
- Replaced implementation-note copy in the overview with concise, live resident coverage values.
- Acceptance evidence: Superadmin production build completed successfully after the directory restoration.
### 2026-07-24 - Resident details, create and edit audit

- Confirmed the canonical resident details route retains the approved profile banner, avatar card, residence snapshot, audit information, live activity metrics, and access-directory tables.
- Confirmed create and edit retain the approved two-column preview/form composition and share the same validated live mutation contract.
- Preserved canonical post-create and post-edit navigation to `/residents/{id}`.
- Rejected restoration of the old photo dropzone because it previews a local file but does not upload or persist it; the functional avatar URL field remains available until a backed upload contract is implemented.
- Removed fake preview identity data and corrected legacy Society copy to Community while preserving the approved card layout.
- Acceptance evidence: Superadmin production build completed successfully after the child-route audit.
