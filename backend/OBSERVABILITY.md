# Backend Observability

## Current baseline
- Structured JSON request logging is emitted from the backend for every request.
- Request failures are correlated with `x-request-id`.
- Optional Sentry capture is enabled when `SENTRY_DSN` is configured.
- Process-level `unhandledRejection` and `uncaughtException` events are captured and flushed before exit.

## Environment variables
- `LOG_LEVEL`
  - `debug`, `info`, `warn`, `error`
- `SENTRY_DSN`
  - optional; when empty, Sentry stays disabled and logs remain local/stdout only
- `SENTRY_ENVIRONMENT`
  - defaults to `development`
- `SENTRY_RELEASE`
  - optional release identifier
- `SENTRY_TRACES_SAMPLE_RATE`
  - optional numeric value between `0` and `1`

## Runtime behavior
- Request logs:
  - `http.request.completed`
- Non-5xx handled failures:
  - `http.request.failed`
- Captured exceptions:
  - `exception.captured`
- Startup/shutdown:
  - `server.started`
  - `server.shutdown.requested`
  - `server.shutdown.completed`

## Production rollout
1. Set `SENTRY_DSN` in the backend runtime environment.
2. Set `SENTRY_ENVIRONMENT` and `SENTRY_RELEASE`.
3. Keep `SENTRY_TRACES_SAMPLE_RATE` conservative for API workloads.
4. Validate one captured backend exception before enabling alert routing.
