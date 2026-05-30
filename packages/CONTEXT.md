# Packages

Shared libraries consumed by web, mobile, and api-node. Platform vocabulary lives in the root [`CONTEXT.md`](../../CONTEXT.md).

## Language

**API contract package**  
`@radionic-homeopathy/types` — Zod schemas, parsers, and claim/upload mappers.  
_Avoid:_ types folder, DTO package.

**API client**  
`@radionic-homeopathy/api-client` — authenticated HTTP client and **Upload intake** `uploadFile` workflow.  
_Avoid:_ SDK, fetch wrapper.

**Identity session package**  
`@radionic-homeopathy/identity-session` — token exchange, refresh, leeway, transport seam, and **Identity session end**.  
_Avoid:_ auth-utils, keycloak-client.

## Relationships

- **API client** validates responses through **API contract package** parsers.
- **Identity session package** is used by app adapters; it does not store tokens.
- **Upload intake** orchestration in **API client** depends on callers injecting the storage PUT step.

## Example dialogue

> **Dev:** "Where do we parse `/me` JSON?"  
> **Domain expert:** "In **API client** via `parseMeResponse` from the **API contract package**."
