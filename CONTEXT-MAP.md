# Context map

Per-context domain glossaries for this monorepo. Read `docs/agents/domain.md` for consumer rules.

| Context | Path | Scope |
| ------- | ---- | ----- |
| `platform` | [`CONTEXT.md`](CONTEXT.md) | Cross-cutting: identity session, API contract, upload intake, shared types |
| `web` | [`apps/web/CONTEXT.md`](apps/web/CONTEXT.md) | Next.js app, NextAuth BFF, dashboard UI |
| `mobile` | [`apps/mobile/CONTEXT.md`](apps/mobile/CONTEXT.md) | Expo app, PKCE auth, NativeWind |
| `api-node` | [`apps/api-node/CONTEXT.md`](apps/api-node/CONTEXT.md) | Express API, Drizzle, S3 uploads, Novu |
| `packages` | [`packages/CONTEXT.md`](packages/CONTEXT.md) | Shared `@fullstack/types`, `api-client` |

**ADRs (system-wide):** [`docs/adr/`](docs/adr/) — apply to all contexts unless a context-specific ADR is added later under `apps/<app>/docs/adr/`.
