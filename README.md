# Fullstack Starter

A Turborepo starter for:

- Next.js web app (App Router, NextAuth + Keycloak, Tailwind CSS v4)
- Expo mobile app (Expo Router, expo-auth-session + Keycloak PKCE, NativeWind v4 / Tailwind v3)
- Node.js API (Express + Drizzle ORM + S3 presigned uploads + Novu)
- Flask API (health-only, ready to extend)
- PostgreSQL
- Redis
- MinIO as local S3-compatible storage
- Novu notification integration (optional)
- Keycloak authentication
- Keycloakify themes (login/account/email) — see [`infra/keycloak/THEMING.md`](infra/keycloak/THEMING.md)

## Requirements

- Node.js with Corepack
- Python 3
- Docker Desktop

## First Run

```bash
corepack enable
corepack prepare pnpm@10.33.4 --activate
pnpm install
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
pnpm infra:up
pnpm --filter api-node db:migrate
pnpm dev
```

If your local Corepack has registry signature issues, use `npx pnpm@10.33.4 <command>` in place of `pnpm <command>`.

If you only want specific apps:

```bash
pnpm dev:web
pnpm dev:mobile
pnpm dev:api-node
pnpm dev:api-python
```

## Windows notes

Two things will trip you up on Windows that don't show up on macOS / Linux:

- **Next.js dev uses webpack, not Turbopack.** `apps/web` runs `next dev --webpack` deliberately. Turbopack 16.x makes thousands of tiny parallel writes to `.next/dev/...` and on Windows (especially when the repo lives on a non-system drive like `D:` and/or under Defender real-time scan) it dies with `os error 1450 — Insufficient system resources`, after which the Node host OOMs trying to deserialise messages from the dead Rust workers. If you ever see `TurbopackInternalError: failed to write to ...middleware-manifest.json` or "Committing semi space failed" with tiny (5–10 MB) heap numbers, do not chase it as a memory bug — it is the kernel refusing I/O. Stay on `--webpack`.
- **Metro must be told the monorepo layout.** [`apps/mobile/metro.config.js`](apps/mobile/metro.config.js) explicitly sets `watchFolders` to the mobile app and the three workspace packages it consumes, plus `disableHierarchicalLookup`. Without that, Metro walks the entire workspace `node_modules` (including pnpm's deeply-nested `.pnpm/<hash>/node_modules/@aws-sdk/...` paths from the api-node deps) and fails on Windows with `lstat: UNKNOWN` once a path exceeds `MAX_PATH`.

If a previous run crashed mid-compile and `apps/web/.next/dev/server/middleware/middleware-manifest.json` is half-written, delete the cache before restarting:

```bash
rm -rf apps/web/.next
```

If port 3000 stays held after a crash:

```bash
netstat -ano | grep ":3000.*LISTENING"
taskkill //F //PID <pid>
```

## Local URLs

- Next.js: http://localhost:3000
- Node API: http://localhost:4000/health
- Flask API: http://localhost:5000/health
- Keycloak: http://localhost:8080
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9001
- Mailpit: http://localhost:8025

## Keycloak themes

Build the Keycloakify themes and start infra:

```bash
pnpm build:keycloak-theme
pnpm infra:up
```

More detail: [`infra/keycloak/THEMING.md`](infra/keycloak/THEMING.md)

## Sign in (web)

1. Visit http://localhost:3000 and click **Sign in with Keycloak**.
2. Use the seeded `demo` / `demo` account (or create one in the `fullstack` realm).
3. After sign-in you land on `/dashboard`. The page calls `GET /me` (read-only **CurrentUser** from the token) and `GET /uploads`. The first upload presign performs **Profile sync** (upserts `users`).
4. Click **Upload a file** to PUT a file to MinIO via a presigned URL. The Node API records the row, flips it to `ready`, and triggers the `upload-created` Novu workflow if `NOVU_SECRET_KEY` is set.

## Sign in (mobile)

1. Run `pnpm dev:mobile` and open the app in Expo Go or a dev build (press `w` for web at http://localhost:8081).
2. Tap **Sign in with Keycloak** — the system browser opens the realm's login page (PKCE flow).
3. After sign-in tokens are stored (`expo-secure-store` on native, `localStorage` on web) and the home screen calls `GET /me`. Tap **Upload demo** to upload a file via presigned URL.

**Expo web + Keycloak:** On web, the OAuth `redirect_uri` is `http://localhost:8081` (not `fullstackstarter://`). The auth code is exchanged via `POST /auth/token` on the Node API (avoids browser CORS to Keycloak on :8080). If Keycloak shows *Invalid parameter: redirect_uri*, add that URI to the `fullstack-mobile` client (already in `fullstack-realm.json` for fresh imports). Include `fullstack-mobile` in `KEYCLOAK_AUDIENCE` so `/me` accepts mobile tokens.

## Keycloak Defaults

- Admin user: `admin`
- Admin password: `admin`
- Realm: `fullstack`
- Demo user: `demo`
- Demo password: `demo`
- Web client: `fullstack-web` (confidential, secret `fullstack-web-dev-secret`)
- Mobile client: `fullstack-mobile` (public, PKCE; native `fullstackstarter://*`, Expo Go `exp://*`, web `http://localhost:8081/*`)
- API audience/client: `fullstack-api`

The Node API verifies bearer tokens against the realm in `apps/api-node/src/integrations/keycloak.ts`. Realm config lives in `infra/keycloak/fullstack-realm.json` and is auto-imported on first startup. To re-import after changing the realm JSON, stop compose and delete `infra/data/postgres/` (or edit the client in the admin UI instead).

## Database migrations

Drizzle ORM owns the PostgreSQL schema (`apps/api-node/src/db/schema/*`).

```bash
# Edit a schema file, then:
pnpm --filter api-node db:generate   # writes a new SQL file under apps/api-node/drizzle/
pnpm --filter api-node db:migrate    # applies pending migrations against DATABASE_URL
pnpm --filter api-node db:studio     # optional: web UI for the database
```

## S3 / Uploads

MinIO creates a local bucket named `app-local` and the compose file enables CORS for `http://localhost:3000` and `http://localhost:8081`. Override `MINIO_CORS_ORIGINS` in `.env` to allow other origins.

The Node API exposes:

- `POST /uploads/presign` → returns `{ uploadId, key, url, headers, expiresAt }`
- `POST /uploads/:id/complete` → flips status to `ready` and triggers Novu
- `GET /uploads` → current user's uploads
- `GET /uploads/:id/download` → presigned download URL

All `/uploads*` routes require a Keycloak access token.

## Novu

Set `NOVU_SECRET_KEY` to enable workflow triggers. When the key is missing, `/health` reports `novu: missing` and trigger calls are no-ops, so the rest of the app keeps working.

The expected workflow `upload-created` is documented in [`infra/novu/README.md`](infra/novu/README.md). Mailpit (port `1025` SMTP, `8025` UI) is included for local email testing.

## Styling

Design tokens (colors, fonts) live in [`packages/config`](packages/config) and are shared across web and mobile.

- **Web** uses **Tailwind CSS v4** via `@tailwindcss/postcss`. Tokens are defined in [`packages/config/tailwind-theme.css`](packages/config/tailwind-theme.css) using the v4 `@theme` block and imported from [`apps/web/app/styles.css`](apps/web/app/styles.css).
- **Mobile** uses **NativeWind v4** which still requires **Tailwind v3**. [`apps/mobile/tailwind.config.js`](apps/mobile/tailwind.config.js) must list `require("nativewind/preset")` first (Metro fails without it), then the shared design preset in [`packages/config/tailwind-preset.cjs`](packages/config/tailwind-preset.cjs). When you change tokens, keep `tailwind-theme.css` (web) and `tailwind-preset.cjs` (mobile) in sync.

## Python API

Create a virtual environment if you want to run Flask outside the root script:

```bash
python -m venv apps/api-python/.venv
source apps/api-python/.venv/Scripts/activate
pip install -r apps/api-python/requirements.txt
python apps/api-python/run.py
```

On macOS/Linux, use `source apps/api-python/.venv/bin/activate` instead.
