# @adhamaa/create-fullstack

Scaffolds a new project from [fullstack-starter](https://github.com/adhamaa/fullstack-starter) at the Git tag that matches the published package version.

## Usage

```bash
npx @adhamaa/create-fullstack@latest my-app
cd my-app
```

Without a directory argument, the CLI prompts interactively.

## Template version

- Published `1.0.0` downloads `github:adhamaa/fullstack-starter#v1.0.0`.
- Unpublished `0.0.0` (local dev) uses `main` unless `TEMPLATE_TAG` is set.

```bash
TEMPLATE_TAG=v1.0.0 node dist/index.js my-app
```

## Maintainer release

Releases are automated when a `v*` tag is pushed to the starter repo. See the root README **Releasing** section.
