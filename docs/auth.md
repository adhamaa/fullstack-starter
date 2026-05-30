# Practitioner authentication (Keycloak)

This document describes the Keycloak realm/client setup the web app and Node API
expect. It does **not** replace live infra config — values below are the dev
defaults already baked into the code, and the parent agent must verify them
against the running Keycloak instance during integration.

## Components

- **Web sign-in** — `apps/web/auth.ts` (NextAuth v5) drives the Authorization
  Code flow with the Keycloak provider. The route handler lives at
  `apps/web/app/api/auth/[...nextauth]/route.ts`. `apps/web/proxy.ts` (Next.js
  16 renamed `middleware` → `proxy`) protects `/practitioner/*` and `/dashboard/*`;
  `apps/web/app/practitioner/page.tsx` also calls `auth()` and redirects
  unauthenticated users to sign-in. Sign-in/out controls:
  `apps/web/components/auth-status.tsx`.
- **API guard** — `apps/api-node/src/middleware/require-auth.ts` validates a
  `Authorization: Bearer <token>` against the realm JWKS + issuer (reusing
  `verifyAccessToken` from `apps/api-node/src/integrations/keycloak.ts`, which
  uses `jose`). It is wired to the example mutating route `POST /formulas`.

## Realm and clients

| Setting | Web (`apps/web/auth.ts` default) | API (`apps/api-node/src/env.ts` default) |
| --- | --- | --- |
| Issuer | `http://localhost:8080/realms/fullstack` | `http://localhost:8080/realms/radionic` |
| Web client | `fullstack-web` (confidential) | — |
| Audience allow-list | n/a | `radionic-web,radionic-api,radionic-mobile` |

> **Parent must reconcile:** the web default realm (`fullstack`) and the API
> default realm (`radionic`) currently differ, as do the client/audience names.
> For an end-to-end browser login both sides must point at the **same realm**,
> and the API `KEYCLOAK_AUDIENCE` must include whatever audience/`azp` the
> `fullstack-web` access token carries. Set `KEYCLOAK_ISSUER`,
> `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET` (web) and `KEYCLOAK_ISSUER`,
> `KEYCLOAK_AUDIENCE` (API) via env to align them — do not hardcode beyond the
> existing dev defaults.

### `fullstack-web` confidential client

- **Client type:** confidential (uses `KEYCLOAK_CLIENT_SECRET`, dev default
  `fullstack-web-dev-secret`).
- **Standard flow** (Authorization Code) enabled.
- **Valid redirect URI:** `http://localhost:3000/api/auth/callback/keycloak`
- **Valid post-logout redirect URI / web origin:** `http://localhost:3000`

### Practitioner role expectation

A `practitioner` realm (or client) role is expected to gate write/edit access.
The current guard verifies signature + issuer + audience only; once roles are
provisioned, extend `requireAuth` to assert the `practitioner` role from the
token's `realm_access.roles` / `resource_access.<client>.roles` claim before
allowing mutations.

## Local validation without live services

This feature was validated via typecheck/build/tests only (no live Keycloak
round-trip). A real browser login is an integration step for the parent agent.
