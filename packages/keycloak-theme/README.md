# `@radionic-homeopathy/keycloak-theme`

Keycloakify login theme based on [keycloakify-shadcn-starter](https://github.com/Oussemasahbeni/keycloakify-shadcn-starter) (shadcn/ui + Tailwind v4). See the [Keycloakify shadcn docs](https://docs.keycloakify.dev/starter-themes/shadcn-ui-tailwind).

## Theme variants

Four login themes are built (web/mobile × default/ramadan):

- `fullstack-web-default`
- `fullstack-web-ramadan`
- `fullstack-mobile-default`
- `fullstack-mobile-ramadan`

Account UI still uses the Keycloakify default account theme. Email templates are built with `keycloakify-emails`.

## Development

```bash
# Fast UI loop (mock Keycloak context, HMR)
pnpm dev:keycloak-theme
# → http://localhost:5173

# Storybook (all login pages + toolbar controls)
pnpm storybook:keycloak-theme
# → http://localhost:6006

# Preview email templates
pnpm --filter @radionic-homeopathy/keycloak-theme emails:preview
```

Customize branding via `SHADCN_THEME_*` env vars in `vite.config.ts` (see starter README for presets, layouts, fonts).

## Build & deploy to local Docker

```bash
pnpm build:keycloak-theme
pnpm infra:up
```

Output is copied to `infra/keycloak/themes/` for the compose volume mount.

More: [`infra/keycloak/THEMING.md`](../../infra/keycloak/THEMING.md)
