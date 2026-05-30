# Radionic Homeopathy

Homeopathic materia medica reference app with first-class **Remedy**, **Formula**, and **Radionic Rate** entities. Rebuilt from [fullstack-starter](https://github.com/adhamaa/fullstack-starter) using Express + Drizzle + pnpm.

See [CONTEXT.md](./CONTEXT.md) for domain glossary (Potency ≠ Rate).

## Stack

- **Web:** Next.js App Router, Tailwind v4 (`next dev --webpack` on Windows)
- **API:** Express + Drizzle ORM + Zod + PostgreSQL
- **Infra:** Docker (PostgreSQL, Redis, MinIO, Keycloak, Mailpit)

## First run

```bash
cd radionic-homeopathy-v2
corepack enable
corepack prepare pnpm@10.33.4 --activate
pnpm install
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
pnpm infra:up
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev:api-node   # terminal 1 — http://localhost:4000
pnpm dev:web      # terminal 2 — http://localhost:3000
```

Or run both apps together:

```bash
pnpm dev
```

### Verify

- `curl http://localhost:4000/health`
- `curl http://localhost:4000/remedies`
- Open http://localhost:3000/remedies

## API routes

| Route | Description |
|-------|-------------|
| `GET /remedies` | List remedies |
| `GET /remedies/:id/details` | Full remedy profile |
| `GET /remedies/:id/rates` | Radionic rates for remedy |
| `GET /formulas` | List formulas |
| `GET /formulas/:id` | Formula with components |
| `GET /formulas/:id/rates` | Rates for formula |
| `GET /rates/search?bank=&value=&q=` | Search rates |
| `GET /symptoms`, `GET /conditions`, `GET /potencies` | Supporting reference data |

## Data import

- Sample seed: `pnpm db:seed` (port of `database/sample-data.sql` plus demo formulas/rates)
- OCR cleanup: `node scripts/clean-materia-ocr.mjs` (requires source OCR text from old project)
- JSON import: legacy script at `apps/api-node/scripts/import-data.js` (to be adapted for Drizzle)

## Phase 2 — deferred

The following starter components are **not wired in MVP**:

- **Keycloak / NextAuth** — public reference library first; auth when practitioners edit rates
- **Expo mobile** — web-first; mobile useful at the radionic bench later
- **Flask api-python / OCR pipeline** — bulk PDF ingestion
- **Redis caching** — add when search latency matters
- **Novu notifications** — no workflows yet

## Windows notes

- Web uses `next dev --webpack` (not Turbopack) for stability on `D:` drives
- Delete stale `.next` after crashes if the dev server misbehaves
