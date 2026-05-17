# ADR-0003: Identity session end semantics

## Status

Accepted

## Context

Web and mobile ended sign-in differently: Next.js called Keycloak’s logout endpoint with a client secret; mobile called OAuth token revocation via `expo-auth-session`. Failed remote calls were handled inconsistently, and it was unclear whether sign-out must end the IdP browser SSO session on every platform. Domain terms **Identity session end** and **IdP session end** are defined in [`CONTEXT.md`](../../CONTEXT.md).

## Decision

- **Minimum (all clients):** **Identity session end** clears local tokens/session and revokes the refresh token when one exists. Access tokens may remain valid until expiry.
- **Failed revoke:** Always complete local sign-out. Surface a non-blocking warning if refresh revocation fails (shared-device honesty). Callers may use `{ localCleared: true, refreshRevoked: boolean }` from a future `identity-session` helper.
- **IdP session end (optional layer):** Web (confidential client) continues best-effort Keycloak logout after local clear + revoke. Mobile native: revoke + local only. Expo web: revoke + local + best-effort IdP browser session end when sign-in used a browser.
- **Implementation:** `endIdentitySession` in `@fullstack/identity-session` with transport-backed revoke and optional **IdP session end** (see package `session-end.ts`).

## Considered options

- **Local clear only** — rejected: refresh tokens could be reused on shared devices.
- **Block sign-out until revoke succeeds** — rejected: poor UX when Keycloak or the network is down.
- **Full IdP logout on every client including native** — rejected: fragile for in-app browser flows; web and mobile web cover SSO where it matters.

## Consequences

- `endIdentitySession` is implemented; adapters pass `endIdpSession: true` on web and Expo web.
- Web keeps NextAuth `signOut` + Keycloak logout in the adapter; mobile web gains a browser logout step aligned with web.
- Tests should cover: revoke success, revoke failure with local still cleared, and platform flags for IdP session end.
