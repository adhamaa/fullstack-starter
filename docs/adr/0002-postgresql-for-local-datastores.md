# ADR-0002: PostgreSQL for local application and Keycloak datastores

## Status

Accepted

## Context

Local development ran two MySQL containers: one for the Node API (`users`, `uploads` via Drizzle) and one for Keycloak’s internal database. The team wanted a single PostgreSQL engine for both, with greenfield resets acceptable for local volumes.

## Decision

- Replace MySQL with **one PostgreSQL 16** service hosting **`app_db`** (api-node) and **`keycloak`** (Keycloak), created via `infra/postgres/init-keycloak.sh` on first boot.
- **Drizzle** uses the `postgresql` dialect with `node-postgres`; the previous MySQL migration chain is replaced by a new Postgres-only initial migration.
- **Configuration:** `DATABASE_URL` for the app; `KEYCLOAK_DB*` for Keycloak compose env; `/health` reports a **`database`** dependency key (engine-agnostic).
- **`updated_at`** is maintained with Drizzle `$onUpdate(() => new Date())` because PostgreSQL has no `ON UPDATE CURRENT_TIMESTAMP`.

## Considered options

- **Two PostgreSQL containers** — rejected for local dev simplicity; one instance with two databases is enough.
- **Migrate existing MySQL data** — rejected; realm JSON and empty local DBs make greenfield reset cheaper.
- **Keep `mysql` in `/health`** — rejected in favour of `database` for stable naming across engine changes.

## Consequences

- Developers must delete `infra/data/postgres/` (not `mysql/` or `keycloak-mysql/`) to fully reset DB state or force Keycloak realm re-import.
- `api-python` health checks use `DATABASE_URL` with `psycopg` instead of discrete `MYSQL_*` variables.
- Production deployment patterns are out of scope for this ADR; the same URL and Drizzle setup apply wherever Postgres is hosted.
