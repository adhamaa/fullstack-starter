# `@fullstack/keycloak-theme`

Keycloakify project that builds **login + account + email** themes for Keycloak **26.x**.

## Build output

Running `pnpm build` in this package will:

- Build the Vite bundle
- Run `keycloakify build`
- Copy/prune themes into `infra/keycloak/themes/` for local Docker mounting

Repo root shortcut:

```bash
pnpm build:keycloak-theme
```

## Notes

- **Theme variants** are configured via `themeName: [...]` in `vite.config.ts` and are available as `kcContext.themeName` in React.
- **Seasonal variants** are implemented as token overrides in `src/theme/variants.ts`.
- **Base theme**: `theme.properties` is normalized during the copy step to start from **`parent=keycloak.v2`** (see `scripts/extract-themes.mjs`).
