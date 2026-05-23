# Changelog

All notable changes to this starter are documented here. Version numbers match Git tags (`v*`) and the `@adhamaa/create-fullstack` npm package.

## 1.0.3

### Added

- Interactive `keycloak-theme` build: choose JAR vs `--skip-jar` and output directory (defaults: JAR, `infra/keycloak/themes`)
- Build scripts: `run-build-themes.mjs`, `resolve-build-options.mjs`, `build-config.mjs`

### Changed

- `build` runs the new themed build pipeline; `extract-themes.mjs` respects `KEYCLOAK_THEME_OUTPUT_DIR`
- Removed unsupported `doCreateJar` from Keycloakify Vite config (Keycloakify 11.15.3)

## 1.0.0 — 2026-05-17

### Added

- `@adhamaa/create-fullstack` CLI (`npx @adhamaa/create-fullstack`)
- GitHub Actions release workflow (tag `v*` → CI, GitHub Release, npm publish)
- Initial public starter: Next.js web, Expo mobile, Node API, Flask API, Keycloak, MinIO uploads, Turborepo monorepo.
