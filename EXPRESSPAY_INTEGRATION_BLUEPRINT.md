# ExpressPay Integration Blueprint (Production)

## Scope
This document locks the production integration contract for ExpressPay across User App, Superadmin, Backend, and Supabase.

## Integration Strategy
1. Phase 1 (now): Hosted checkout via ExpressPay Merchant API.
2. Phase 2 (optional later): Merchant Direct / tokenized charges after PCI scope review.

Rationale:
- Hosted checkout reduces PCI burden and avoids collecting/storing sensitive card data in app code.
- It aligns with current architecture where business entities (service booking, amenity booking, personal hub purchase) already create internal payment records.

## Non-Negotiable Security Rules
1. Never store raw PAN, CVV, card PIN, or full card expiry in app/apps/api/database.
2. Gateway credentials must not be stored as plaintext in `app_settings.value`.
3. Gateway secrets must be stored in Supabase Vault and referenced by non-secret config rows.
4. All payment completion must be server-verified (callback or verify endpoint), never client-only success flags.
5. Use idempotency keys for payment initiation and callback upserts.

## Canonical Flow (Phase 1)
1. User confirms a payable item in app.
2. App calls backend `POST /payments/expresspay/initiate` with authenticated bearer token.
3. Backend creates/updates a `payments` row with status `pending`, provider metadata, and idempotency key.
4. Backend calls ExpressPay init API and returns `checkout_url` + internal `payment_id` to app.
5. App opens hosted checkout URL.
6. ExpressPay redirects/calls callback endpoint.
7. Backend callback verifies provider reference and updates local `payments.status`.
8. App polls/refreshes `GET /payments/expresspay/status/:paymentId` until terminal state.

## Status Contract
Provider-to-local status mapping:
- `approved|paid|success` -> `completed`
- `pending|processing|initiated` -> `pending`
- `failed|declined|cancelled|reversed|expired` -> `failed`

Terminal statuses:
- `completed`
- `failed`

Non-terminal statuses:
- `pending`

## Data Ownership
### Internal Payment (`public.payments`)
Required fields:
- `id`
- `amount`
- `unit_id`
- `payer_id`
- `payment_type`
- `payment_method` (e.g. `card`, `mobile_money`)
- `payment_gateway` (`expresspay`)
- `status`
- `transaction_id` (internal reference)
- `metadata` (gateway reference, channel, callback payload digest, etc.)

### Gateway Config
Use provider config table (community-aware) + Vault references.
No sensitive values in user-accessible tables.

## API Contract
### `POST /payments/expresspay/initiate`
Auth: required

Request:
- `amount: number`
- `currency: string` (default `GHS`)
- `payment_type: string`
- `payment_method: string`
- `description?: string`
- `unit_id: string`
- `booking_id?: string`
- `metadata?: object`
- `idempotency_key?: string`

Response:
- `payment_id: string`
- `transaction_id: string`
- `checkout_url: string`
- `provider_reference?: string`
- `status: "pending"`

### `POST /payments/expresspay/callback`
Auth: none (provider callback)

Behavior:
- Validate callback payload shape and signature/hash when available.
- Resolve local payment by provider reference or internal transaction id.
- Idempotent update of `payments.status` and metadata.
- Return `200` once persisted.

### `POST /payments/expresspay/verify`
Auth: required (admin/service/internal use)

Behavior:
- Force provider verification for a payment and reconcile local status.

### `GET /payments/expresspay/status/:paymentId`
Auth: required

Behavior:
- Return local status and references for app polling and UX.

## Superadmin Responsibilities
1. Configure ExpressPay enable/mode and non-secret fields in settings UI.
2. Configure Vault-backed secret references (merchant key/API key) via protected admin flow.
3. Trigger connection test via backend (real API ping, no UI-only toast/alert).
4. Observe transaction health: total initiated, completed, failed, pending, callback failures.

## Observability
Log structured fields for each orchestration step:
- `payment_id`
- `transaction_id`
- `gateway`
- `action` (`initiate|callback|verify|status`)
- `result` (`success|failure`)
- `error_code`

## Rollout Order
1. Secure config storage + RLS policy hardening.
2. Backend orchestration endpoints.
3. Superadmin settings wiring and connection test.
4. User app payment-method screens to call backend initiate endpoint.
5. Callback verification and reconciliation jobs/alerts.

## Out of Scope for This Slice
- Card token vaulting for one-click payments.
- Subscription recurring billing automation.
- Provider failover routing across multiple gateways.
