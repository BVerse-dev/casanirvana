# Visitors Lifecycle Contract (User <-> Guard <-> Superadmin)

## Scope
This contract defines the production lifecycle for visitor passes stored in `public.visitor_passes` and rendered in the user app, guard app, and superadmin dashboard.

## Canonical Source
- Table: `public.visitor_passes`
- Tenant anchors: `community_id`, `unit_id`
- Actor anchors: `created_by`, `approved_by`, `checked_in_by`, `checked_out_by`
- Identity fields: `entry_code`, `qr_code_data`

## Allowed Status Values
- `pending`
- `approved`
- `denied`
- `checked_in`
- `checked_out`
- `cancelled`
- `expired`

## State Transitions
1. Create: `pending`
2. Approve flow: `pending -> approved`
3. Reject flow: `pending -> denied`
4. Entry flow: `approved -> checked_in`
5. Exit flow: `checked_in -> checked_out`
6. Optional lifecycle end states: `cancelled`, `expired`

## Required Write Rules
- Create must set: `visitor_name`, `visitor_type`, `from_date`, `to_date`, `unit_id`, `created_by`.
- `community_id` must be derived from `unit_id` (trigger-backed).
- Approve/Deny must set: `approved_by`.
- Check-in must set: `checked_in_at`, `checked_in_by`, `actual_entry_time`.
- Check-out must set: `checked_out_at`, `checked_out_by`, `actual_exit_time`.

## App Responsibilities
- User app:
  - Creates visitor passes for current resident/unit.
  - Reads only tenant-scoped rows via RLS.
  - Uses canonical status mapping (no fallback to unrelated labels).
- Guard app:
  - Executes check-in/check-out operations.
  - Adds guard metadata (`checked_in_by`, `checked_out_by`, notes if needed).
- Superadmin:
  - Performs approve/deny/check-in/check-out/delete for scoped communities.
  - Must show tenant attribution columns: community, unit, created-by, agency.

## Realtime Contract
- Query key family: `visitor-passes`.
- Global realtime subscription is owned by `AuthContext` through `useRealtimeSubscriptions`.
- Screens should not add duplicate table-level visitor subscriptions.

## RLS Expectations
- Resident actor can create/read/update/delete their own scoped passes by policy.
- Unit occupants can read relevant unit passes.
- Admin/staff roles are constrained by `can_access_community` and/or `can_access_unit`.

## Data Quality Guardrails
- `community_id` is backfilled and auto-derived from `unit_id` for insert/update.
- Historical rows without both `unit_id` and `community_id` require explicit manual cleanup.
