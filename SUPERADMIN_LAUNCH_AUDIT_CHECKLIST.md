# Superadmin Launch Audit Checklist

## Operating rules

- Baseline: 241 filesystem routes discovered on 23 July 2026.
- The machine-readable source is `SUPERADMIN_ROUTE_MANIFEST.json`.
- Work in sidebar order and one vertical slice at a time.
- Mark a route complete only after backend/data, authorization, responsive, accessibility, build and production evidence is recorded.
- Preserve the current visual system; correct organization, truthfulness, usability, routing and security defects without redesigning the product.
- SMTP-dependent checks remain deferred until credentials are supplied.

## Phase sequence

- [x] Foundation: monorepo path reconciliation and initial 241-route inventory.
- [ ] Application shell and authentication/authorization boundary.
- [ ] Dashboards.
- [ ] Community Management.
- [ ] People.
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

### 2026-07-23 - Phase 52 foundation

- [x] Confirmed the active monorepo application root is `apps/superadmin`.
- [x] Confirmed root scripts, CI cache paths, split-repository prefixes and database-type synchronization use the new monorepo paths.
- [x] Generated the initial route, menu and internal-link manifest.
- [x] Added a route-contract test before canonical navigation changes.
- [x] Route-contract tests passed: 241 unique filesystem routes, 93 sidebar destinations and zero unresolved sidebar destinations.
- [x] Strict `build:check` and the environment-gated production build passed under Next.js 14.2.6.
- [ ] Handle optional `sharp` installation and Browserslist database refresh in the dedicated dependency-security slice, not this routing foundation change.
- [ ] Begin the Application Shell slice after foundation verification is committed and deployed.
