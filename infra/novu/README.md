# Novu Setup

The Node API is ready to use Novu through `NOVU_SECRET_KEY`.

For the first local setup, use Novu Cloud or your own existing Novu instance:

1. Create a Novu project.
2. Copy the API secret key.
3. Set `NOVU_SECRET_KEY` in `.env` or `apps/api-node/.env`.
4. Add notification workflows in Novu, then trigger them from `apps/api-node/src/integrations/novu.ts`.

The full self-hosted Novu stack has several moving parts and is best added after the base app and identity flow are stable. `infra/docker-compose.yml` includes Mailpit for local email testing.
