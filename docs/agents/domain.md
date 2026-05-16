# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root — lists each context and its `CONTEXT.md` path.
- **`CONTEXT.md`** for every context relevant to the task (start with `platform`, then the app or package you're changing).
- **`docs/adr/`** — read ADRs that touch the area you're about to work in. Also check `apps/<app>/docs/adr/` when present for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## File structure (this repo)

Multi-context monorepo:

```
/
├── CONTEXT-MAP.md
├── CONTEXT.md                         ← platform glossary (exists)
├── docs/adr/                          ← system-wide ADRs (exists)
├── apps/web/CONTEXT.md                ← web-specific (lazy)
├── apps/mobile/CONTEXT.md             ← mobile-specific (lazy)
├── apps/api-node/CONTEXT.md           ← api-node-specific (lazy)
└── packages/CONTEXT.md                ← shared packages (lazy)
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0002 (postgresql-for-local-datastores) — but worth reopening because…_
