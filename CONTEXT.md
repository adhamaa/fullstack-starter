# Domain context

Vocabulary for architecture reviews and implementation. Prefer these terms over ad-hoc names.

## Identity session

End-user authentication against the Keycloak realm (`fullstack`). Clients obtain access tokens; the Node API verifies bearer tokens via JWKS.

- **Web adapter:** NextAuth session holding `accessToken` ([`apps/web/auth.ts`](apps/web/auth.ts))
- **Mobile adapter:** PKCE flow with SecureStore ([`apps/mobile/src/auth/AuthContext.tsx`](apps/mobile/src/auth/AuthContext.tsx))
- **API verification:** JWT signature, issuer, and audience/azp allow-list ([`apps/api-node/src/integrations/keycloak.ts`](apps/api-node/src/integrations/keycloak.ts))

Realm clients: `fullstack-web` (confidential), `fullstack-mobile` (public PKCE), `fullstack-api` (resource audience).

## CurrentUser

Signed-in person returned by `GET /me`. Mapped from Keycloak access-token claims via `currentUserFromKeycloakClaims` in [`packages/types`](packages/types).

## Upload intake

Lifecycle for user files: presign → PUT to object storage → complete → list → download URL.

- **Authoritative contract:** Zod schemas and `Upload` type in [`@fullstack/types`](packages/types)
- **Implementation:** [`apps/api-node/src/routes/uploads.ts`](apps/api-node/src/routes/uploads.ts)
- **Web BFF:** [`apps/web/lib/proxy-authenticated-api.ts`](apps/web/lib/proxy-authenticated-api.ts) proxies authenticated calls to the Node API

## API contract

HTTP JSON shapes shared by `@fullstack/types`, `@fullstack/api-client`, and `api-node`. Schemas are the test surface; handlers serialize through `uploadFromDb` and claim mappers rather than ad-hoc objects.

## Flagged ambiguities

- **Database** was used to mean both application persistence (`users`, `uploads` via api-node) and Keycloak’s internal identity store — resolved: the PostgreSQL migration includes **both** datastores.
