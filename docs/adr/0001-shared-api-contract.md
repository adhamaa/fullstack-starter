# ADR-0001: Shared API contract in `@fullstack/types`

## Status

Accepted

## Context

Clients (`@fullstack/api-client`, web, mobile) imported DTO types from `@fullstack/types`, but `api-node` re-declared the same shapes inline. The package was shallow on the server: removing it had no effect on the API.

## Decision

- `@fullstack/types` owns Zod schemas and inferred types for all public JSON bodies.
- `api-node` validates requests and serializes responses through shared schemas and mappers (`uploadFromDb`, `currentUserFromKeycloakClaims`).
- Audience/azp rules for bearer tokens live in a testable module (`audience.ts`), called from Keycloak verification.

## Consequences

- Contract changes require updating schemas once; Vitest tests guard round-trips.
- `api-node` depends on Zod via `@fullstack/types` (single version at the workspace root).
- Future Identity session extraction (web/mobile refresh) remains a separate deepening effort.
