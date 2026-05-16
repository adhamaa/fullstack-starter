# Keycloak themes (Keycloakify)

This repo builds Keycloak themes from `packages/keycloak-theme` and copies them to `infra/keycloak/themes/`.

## Build

From the repo root:

```bash
pnpm build:keycloak-theme
```

### Windows note (Java + Maven)

Keycloakify runs a Maven step. This repo expects **portable** installs under `tools/` (ignored by git):

- `tools/jdk21` — Temurin **JDK 21**
- `tools/apache-maven-3.9.6` — **Maven 3.9.6** unpack

`pnpm build:keycloak-theme` runs `packages/keycloak-theme`’s `build:kc` via `scripts/run-build-kc.mjs`, which sets **`JAVA_HOME`**, **`MAVEN_HOME`**, and **`PATH`** for those folders automatically.

For **interactive shells** (manual `mvn` / `java`), from the repo root:

- Git Bash: `source tools/keycloakify-env.sh`
- PowerShell: `. ./tools/keycloakify-env.ps1`

Alternatively install Temurin JDK 21 + Maven globally and ensure `JAVA_HOME` is set.

## Docker

`infra/docker-compose.yml` mounts:

- `infra/keycloak/themes` → `/opt/keycloak/themes`

### Keycloak keeps restarting (Liquibase / PostgreSQL)

If logs show **`Duplicate column name`** or other migration errors, the **PostgreSQL data directory** is usually in a bad state (e.g. interrupted upgrade). For **local dev**, stop compose, delete **`infra/data/postgres`**, then start the stack again so Keycloak can run migrations on a clean database (realm JSON will re-import).

## Theme variants

The build produces these theme names:

- `fullstack-web-default`
- `fullstack-web-ramadan`
- `fullstack-mobile-default`
- `fullstack-mobile-ramadan`

**Manual seasonal switching**: Keycloak Admin → Realm Settings → Themes (Login / Account / Email).

**Automatic web vs mobile (login UI)**: `infra/keycloak/fullstack-realm.json` sets per-client `login_theme`:

- `fullstack-web` → `fullstack-web-default`
- `fullstack-mobile` → `fullstack-mobile-default`

**Account + Email**: Keycloak applies these at the **realm** level (defaults are set in the realm import). True per-client *account/email* selection typically requires a custom Keycloak SPI/provider.

## Base parent theme

Each generated theme’s `theme.properties` is normalized to:

- `parent=keycloak.v2`
- `import=common/keycloak`
