# Mobile

Expo app using public PKCE against Keycloak. Native uses secure storage; Expo web uses the Node API token proxy to avoid Keycloak CORS.

## Language

**Mobile adapter**  
The Expo **Identity session** implementation: PKCE sign-in, token storage, refresh, and sign-out.  
_Avoid:_ AuthContext (implementation name), auth module.

**Token proxy**  
Expo web calls `POST /auth/token` and `/auth/refresh` on the Node API instead of Keycloak directly.  
_Avoid:_ BFF (web term), CORS workaround (implementation detail in docs only).

## Relationships

- **Mobile adapter** obtains tokens via Keycloak (native) or **Token proxy** (Expo web).
- **Upload intake** calls the Node API directly with a bearer from **Mobile adapter**.
- **Identity session end** on native is revoke + local clear; on Expo web adds **IdP session end** (API logout + browser logout URL).

## Example dialogue

> **Dev:** "Why doesn't mobile web hit Keycloak on port 8080?"  
> **Domain expert:** "Use the **Token proxy** — browsers block that CORS. Native talks to Keycloak directly."
