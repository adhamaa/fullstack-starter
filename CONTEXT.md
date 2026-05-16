# Platform

Cross-cutting vocabulary for identity, uploads, and the shared HTTP contract across web, mobile, and the Node API.

## Language

**Identity session**  
End-user authentication against the Keycloak realm (`fullstack`): clients hold access tokens; the API verifies bearer JWTs (signature, issuer, audience).

_Adapters:_ web (confidential client session), mobile (public PKCE), API (JWKS verification).  
_Avoid:_ login flow, auth state, session cookie (unless meaning Identity session specifically).

**Identity session end**  
User-initiated sign-out: local tokens cleared, refresh token revoked when possible; user is warned if revoke fails but remains signed out locally.  
_Avoid:_ sign out blocked on network error, silent failed revoke.

**IdP session end**  
Ending the browser SSO session at Keycloak (optional layer on top of Identity session end).  
_Adapters:_ web (confidential logout endpoint); mobile Expo web (browser logout when sign-in used a browser). Native mobile: revoke only unless product requires otherwise.  
_Avoid:_ assuming sign out always clears SSO cookie on every platform.

**CurrentUser**  
The signed-in person as derived from access-token claims (id, email, name, roles).  
_Avoid:_ user row, database user, account (when meaning persistence).

**Profile sync**  
Mirroring Identity session claims into the application `users` table so foreign keys (e.g. uploads) have a stable parent row.  
_Avoid:_ GET /me side effect, upsert on read.

**Upload intake**  
Lifecycle for user-owned files: presign → PUT to object storage → complete → list → download URL.

**Complete** (upload step)  
The step that marks an upload ready for download; succeeds only when the object exists in storage (not merely when the client asserts PUT finished).  
_Avoid:_ finalize without verification, trust-client complete.

**API contract**  
HTTP JSON shapes shared by clients and the Node API; Zod schemas are the authoritative definitions and test surface.  
_Avoid:_ DTO (in domain discussion), OpenAPI-only contract (schemas lead).

**Subscriber sync**  
Registering the signed-in person with the notification provider so upload events can be delivered.  
_Avoid:_ identify on every page load, Novu call from GET /me.

**Upload intake BFF**  
Web-only server routes that attach the Identity session access token and forward Upload intake API calls to the Node API.  
_Avoid:_ proxy (ambiguous with Next.js `proxy.ts`), middleware (framework term).

Realm clients: `fullstack-web` (confidential), `fullstack-mobile` (public PKCE), `fullstack-api` (resource audience).

## Relationships

- **CurrentUser** is produced from the **Identity session** access token, not from Postgres.
- **GET /me** returns **CurrentUser** only; it does not perform **Profile sync** or **Subscriber sync**.
- **Profile sync** runs at **Upload intake** presign (before creating an upload row).
- **Subscriber sync** runs at **Upload intake** presign (idempotent per subject), not on **GET /me**.
- **Complete** transitions an upload to `ready` only after storage verification.
- An **Upload** belongs to exactly one application user row (identity subject).
- **Upload intake BFF** is the web adapter for Upload intake; mobile calls the Node API directly with a bearer token.

## Example dialogue

> **Dev:** "Should `GET /me` upsert the users table?"  
> **Domain expert:** "No — that's **Profile sync**. `/me` returns **CurrentUser** from the token. Sync when they start **Upload intake** (presign), so the FK exists before the upload row."

> **Dev:** "Mobile never called `/me` but presign failed on FK."  
> **Domain expert:** "Presign must **Profile sync** first. Don't rely on dashboard order."

> **Dev:** "Can we mark complete if the PUT failed?"  
> **Domain expert:** "No — **Complete** means the object is in storage. Otherwise list shows ready files that 404 on download."

> **Dev:** "Sign out failed to revoke — keep the user logged in?"  
> **Domain expert:** "No — **Identity session end** always clears local state. Tell them revoke may have failed if you want honesty on shared devices."

> **Dev:** "Should mobile native call Keycloak logout?"  
> **Domain expert:** "**Identity session end** is revoke + local clear. **IdP session end** on mobile web only, where sign-in used a browser."

## Flagged ambiguities

- **Database** meant both application persistence (`users`, `uploads`) and Keycloak's identity store — resolved: one PostgreSQL instance, two databases (`app_db`, `keycloak`).
- **GET /me** previously performed **Profile sync** and **Subscriber sync** on every call — resolved: read-only **CurrentUser**; sync at presign.
- **Complete** previously trusted the client without a storage check — resolved: object must exist before `ready`.
- **Sign out** mixed local clear, revoke, and Keycloak logout without platform rules — resolved: see **Identity session end** and **IdP session end**.
