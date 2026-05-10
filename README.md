# Fullstack Starter

A Turborepo starter for:

- Next.js web app
- Expo mobile app
- Node.js API
- Flask API
- MySQL
- Redis
- MinIO as local S3-compatible storage
- Novu notification integration
- Keycloak authentication

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
pnpm infra:up
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

## Local URLs

- Next.js: http://localhost:3000
- Node API: http://localhost:4000/health
- Flask API: http://localhost:5000/health
- Keycloak: http://localhost:8080
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9001
- Mailpit: http://localhost:8025

## Keycloak Defaults

- Admin user: `admin`
- Admin password: `admin`
- Realm: `fullstack`
- Demo user: `demo`
- Demo password: `demo`
- Web client: `fullstack-web`
- Mobile client: `fullstack-mobile`
- API audience/client: `fullstack-api`

The Node API already includes bearer token verification against the `fullstack` realm in `apps/api-node/src/integrations/keycloak.ts`.

## S3 Defaults

MinIO creates a local bucket named `app-local`.

- Access key: `minioadmin`
- Secret key: `minioadmin`
- Endpoint: `http://localhost:9000`

## Novu

Set `NOVU_SECRET_KEY` to connect the Node API to Novu. The base project documents this in `infra/novu/README.md` and includes Mailpit for local email capture.

## Python API

Create a virtual environment if you want to run Flask outside the root script:

```bash
python -m venv apps/api-python/.venv
source apps/api-python/.venv/Scripts/activate
pip install -r apps/api-python/requirements.txt
python apps/api-python/run.py
```

On macOS/Linux, use `source apps/api-python/.venv/bin/activate` instead.

## Next Steps

- Add Keycloak login flows to `apps/web` and `apps/mobile`.
- Add database migrations for MySQL.
- Add actual upload endpoints using the S3 client.
- Add Novu workflow triggers for product notifications.
- Add CI once the runtime choices are stable.
