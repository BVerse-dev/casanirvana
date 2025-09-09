Here’s a clean, drop-in Copilot instructions prompt for wiring the Guard App to Supabase—mirroring the User-App process, but with extra care for cross-app behavior. It’s written so Copilot thinks first, checks existing work, then acts, and never touches the UI.

⸻

Guard App ↔ Supabase Integration (Strict, Step-by-Step)

You have full access to Supabase via the MCP server in VS Code.
Mission: Verify and complete the Guard App’s wiring to Supabase so it works in lockstep with the User-App and Super-Admin—with zero UI layout/style changes. Every change must be preceded by a review and followed by a short findings report. After each screen, pause and ask: “Guard App —  done. What’s next?”

Non-Negotiables
	•	NO UI CHANGES EVER. Do not alter JSX structure, Tailwind/CSS classes, component hierarchy, copy, spacing, or visuals.
	•	THINK FIRST. Before writing code or SQL, scan the existing implementation. If it’s already correct, do nothing.
	•	ASK FIRST. After each review, present findings and options, then wait for approval before changes.
	•	DO NOT RECREATE code or schema that already works. Extend safely instead.
	•	Consistency: The Guard App must align with User-App and Super-Admin data contracts and behaviors.

Start-Up Checklist (One-Time)
	1.	Confirm Supabase MCP connection is active in VS Code.
	2.	Identify the env usage (Expo RN): confirm the app reads EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
	3.	Confirm role model: profiles.role = 'guard' is the canonical guard identity.

⸻

Phase 0 — Cross-System Discovery (No changes yet)

For each step, produce a short written report with exact file paths and tables. Do not modify code yet.

A) Database Scan (via MCP):
	•	List tables relevant to guards: profiles (role=guard), guard_assignments, visitor_passes, societies, units, messages, emergency_alerts, notices, complaints (read only if applicable), audit_logs (if used), and any guard-specific lookup tables.
	•	For each table, capture: columns, types, defaults, RLS policies, and important FKs. Note any naming mismatches with the Guard App.

B) User-App Review (read-only):
	•	Summarize how the User-App hits the same tables (e.g., visitor_passes, messages, amenity_bookings, emergency_alerts) and any conventions (timestamps like created_at, enums like status, field names like unit_id vs unitId).
	•	Record any differences that the Guard App must respect to stay consistent.

C) Super-Admin Review (read-only):
	•	Summarize the management flows that affect guards: e.g., creating guard_assignments, approving visitor_passes, broadcasting emergency_alerts, sending notices/messages.
	•	Note expected read/write paths for Guards (e.g., check-in/out updates on visitor_passes).

Deliverable: a brief “Cross-System Findings” list of tables/columns, field naming conventions, and any gaps or collisions.

⸻

Phase 1 — Guard App Screen-by-Screen Audit (Menu order)

For each screen in the Guard App, follow this 8-step loop. After step 3, pause and ask for approval before you change anything.
	1.	Identify UI & Behaviors (No code changes)
	•	List all surface elements: inputs, toggles, buttons, dropdowns, search bars, tables/cards, counters, charts, badges, tabs.
	•	Describe intended behaviors: reads, filters, pagination, mutations, real-time updates.
	2.	Current Wiring Check (No changes)
	•	Locate existing hooks/services (e.g., src/hooks/guards/*, src/services/*, supabase.ts).
	•	Verify queries/mutations: table names, selected columns, filters, ordering, pagination, error handling.
	•	Verify real-time subscriptions (if any).
	•	Note gaps (e.g., missing filter, wrong column, no mutation, broken key handling).
	3.	Schema Comparison (No changes)
	•	Compare UI fields to DB columns.
	•	Identify missing columns, wrong types, or naming mismatches (e.g., UI expects created_at but DB has createdAt).
	•	Propose exact SQL to add missing columns without renaming/removing existing ones.
	•	Pause here and present:
	•	a) Findings summary
	•	b) Minimal change plan (hooks + SQL)
	•	c) Risks/alternatives
	•	Ask for approval.
	4.	Safe Schema Updates (if approved)
	•	Generate precise SQL for any missing columns/constraints only (no destructive changes).
	•	Include IF NOT EXISTS clauses where possible; preserve data.
	5.	Hook & Service Fixes (full code, no placeholders)
	•	Update or add typed hooks (list/get/create/update/delete) for the screen’s tables.
	•	Align field names with the confirmed schema (don’t force schema renames; adapt the query).
	•	Add pagination/sorting exactly as UI implies.
	•	Implement real-time subscriptions when the UI implies live updates (e.g., new visitors, alerts).
	•	Ensure robust error/empty/loading handling without altering UI markup.
	6.	RLS & Roles Verification
	•	Validate that a guard can read/write only what’s intended (e.g., passes in assigned society).
	•	If RLS blocks a legitimate action, propose a minimal, targeted policy (read/update on row ownership or via assignment joins). Present for approval, then generate SQL.
	7.	Seed Data (Guard-specific)
	•	If the screen relied on mock data, propose SQL seed mirroring that data so the UI shows real rows immediately (no UI edits).
	•	Respect referential integrity (e.g., link visitor_passes to real units/societies/profiles for guards).
	8.	Report & Pause
	•	Post a short “Screen Report”: what changed, hooks added/updated, SQL applied, test cases run (see next section), and results.
	•	Ask: “Guard App —  done. What’s next?”

Screens to cover (typical Guard App):
	•	Auth / Sign-In (guards only)
	•	Guard Dashboard (assigned gate/shift summary, KPIs)
	•	Visitor Management:
	•	Pre-approved passes (validate & check-in/out)
	•	Walk-in visitor registration
	•	QR scan flow (if present)
	•	Visit logs and filters
	•	Emergency Alerts (view, acknowledge, follow instructions, mark resolved if permitted)
	•	Messages/Announcements (read, mark read, optional reply if permitted)
	•	Guard Assignments & Shifts (view current/next shift, handover notes)
	•	Patrol/Checkpoints (record passes, timestamps, incident notes)
	•	Resident/Unit Quick Lookup (read-only contact / unit meta as allowed)
	•	Notices (read, filter, mark read)
	•	Incidents/Reports (create/update if in scope)

⸻

Cross-App Workflow Guarantees
	•	User ↔ Guard (Visitor Passes):
	•	User creates pass → Guard can find/scan/validate it → Guard check-in/out updates persist and are visible to User and Super-Admin.
	•	Super-Admin ↔ Guard (Assignments/Alerts):
	•	Super-Admin assigns guards to societies/shifts → Guard sees assignments.
	•	Super-Admin sends emergency alert → Guard receives in real time and can acknowledge; status reflects in Super-Admin.
	•	Messaging/Notices:
	•	Broadcasts reach Guards; read receipts update back to Super-Admin if supported by schema.

⸻

Data Contracts & Types
	•	Use the same column names already established (e.g., created_at, status, unit_id, society_id, assigned_to, etc.).
	•	If the Guard App code expects a field that doesn’t exist, add the column (don’t rename).
	•	Keep TypeScript types in sync with the final schema; update generated types or shared database.types.ts as needed.
	•	Ensure date/time fields are consistent across apps (TIMESTAMPTZ vs DATE, etc.).

⸻

RLS & Security Expectations
	•	Guards can only read/write rows scoped by assignment (e.g., societies they’re assigned to, or passes they process).
	•	Write actions are minimal and auditable (e.g., visitor_passes.actual_entry_time, status, security_guard_in/out).
	•	Where necessary, propose surgical RLS policies (with explicit USING clauses) and await approval before generating SQL.

⸻

Testing Protocol (Each Screen)
	•	Happy Path: load, list, filter, sort; create/update/delete (if permitted); success state reflected in Supabase.
	•	RLS path: try a disallowed action; confirm polite error and no data leakage.
	•	Real-time: trigger updates (e.g., create a pass in Super-Admin) and verify UI refresh without manual reload.
	•	Resilience: validate loading/empty/error states (no UI breakage).
	•	Cross-system: verify data appears consistently in Super-Admin and User-App where applicable.

⸻

Reporting Template (use every time)

Screen: <ScreenName>
Files Reviewed: <paths>
Current State: <what works / what’s partial / what’s broken>
Schema Match: <OK / issues: list>
Proposed Fixes: <hooks to add/update, minimal SQL>
RLS Notes: <policy needs or OK>
Seed Needed: <yes/no + summary>
Result After Fixes: <tests passed/failed>
Next Step?: “Guard App —  done. What’s next?”

⸻

Reminders
	•	Never touch UI design.
	•	Never delete or rename existing columns; add what’s needed to match the Guard App expectations.
	•	Always check first; don’t recreate working code or schema.
	•	After each screen’s report, pause and ask before proceeding.