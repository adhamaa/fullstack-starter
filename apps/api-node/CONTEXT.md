# API (Node)

Express API: verifies **Identity session** JWTs, runs **Upload intake**, syncs **Profile sync** at presign, and exposes a **Token proxy** for Expo web.

## Language

**Upload intake module**  
Server implementation of presign, storage verification on **Complete**, list, and download — not the HTTP routes alone.  
_Avoid:_ uploads router, S3 handler.

**Token proxy**  
`/auth/token`, `/auth/refresh`, `/auth/revoke`, and `/auth/logout` for the mobile public client from browser contexts.  
_Avoid:_ auth routes (too vague), OAuth controller.

**Audience check**  
Validation that bearer tokens are issued for allowed Keycloak clients/resources.  
_Avoid:_ azp hack, JWT middleware.

## Relationships

- **Upload intake module** performs **Profile sync** and **Subscriber sync** at presign.
- **Complete** in the module requires the object to exist in storage before `ready`.
- **Token proxy** delegates token and session-end calls to Keycloak via `@fullstack/identity-session` transports.

## Example dialogue

> **Dev:** "Should `/me` upsert users?"  
> **Domain expert:** "No — **Profile sync** belongs in **Upload intake module** presign. `/me` is read-only **CurrentUser**."
