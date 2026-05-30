# Web

Next.js dashboard and server routes for the platform. Uses a confidential Keycloak client and keeps access tokens on the server for Upload intake.

## Language

**Dashboard**  
Authenticated UI under `/dashboard` showing **CurrentUser** and **Upload intake** demos.  
_Avoid:_ admin panel, portal (unless product expands).

**Upload intake BFF**  
Server routes under `/dashboard/api/*` that attach the session access token and call the Node API.  
_Avoid:_ proxy routes (conflicts with Next.js `proxy.ts`).

**Session gate**  
Next.js `proxy.ts` export protecting `/dashboard` via NextAuth — Identity session enforcement at the edge.  
_Avoid:_ middleware (legacy name), auth proxy.

## Relationships

- **Session gate** runs before **Dashboard** renders.
- **Upload intake BFF** is the web adapter for **Upload intake**; the browser still PUTs files directly to object storage.
- **Identity session end** on web uses `@radionic-homeopathy/identity-session` with **IdP session end** enabled.

## Example dialogue

> **Dev:** "Can the upload panel call the Node API with the user's bearer token?"  
> **Domain expert:** "No — use **Upload intake BFF** so the token stays server-side."
