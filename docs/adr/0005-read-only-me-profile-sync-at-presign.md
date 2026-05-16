# ADR-0005: Read-only GET /me; profile and subscriber sync at presign

## Status

Accepted

## Context

`GET /me` returned **CurrentUser** but also upserted the `users` table and called Novu `identifySubscriber` on every request. That mixed a read-shaped endpoint with writes, made dashboard refreshes expensive, and allowed mobile upload flows to hit foreign-key errors when `/me` was skipped before presign. Terms **CurrentUser**, **Profile sync**, and **Subscriber sync** are in [`CONTEXT.md`](../../CONTEXT.md).

## Decision

- **`GET /me`** returns **CurrentUser** from JWT claims only. No Postgres writes and no notification identify on this route.
- **Profile sync** (upsert `users` from token claims) runs at **Upload intake** presign, before inserting an upload row, so `uploads.user_id` FK is satisfied even when `/me` was never called.
- **Subscriber sync** (Novu identify) runs at presign as well, idempotent per subject — not on every `/me` poll.
- Claim mapping stays in `@fullstack/types` (`currentUserFromKeycloakClaims`, `parseKeycloakAccessClaims`).

## Considered options

- **Keep bundled behaviour** — rejected: hidden side effects on GET; poor locality for “who am I?” vs persistence.
- **Separate `POST /users/sync`** — rejected for now: extra client contract; presign is already a authenticated write and needs the user row.
- **Subscriber sync only on complete** — rejected: notifications may be needed before first upload event; presign is the chosen idempotent hook.

## Consequences

- Web dashboard may call `/me` without mutating DB; first upload presign creates the user row.
- Mobile upload demo works without a prior `/me` call.
- README/onboarding copy should say profile sync happens at first presign, not “`/me` upserts users”.
- Tests: `/me` is pure given claims; presign tests assert user row + identify when Novu is configured or mocked.
