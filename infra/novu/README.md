# Novu Setup

The Node API is ready to use Novu through `NOVU_SECRET_KEY`.

For the first local setup, use Novu Cloud or your own existing Novu instance:

1. Create a Novu project.
2. Copy the API secret key.
3. Set `NOVU_SECRET_KEY` in `.env` or `apps/api-node/.env`.
4. Add notification workflows in Novu, then trigger them from `apps/api-node/src/integrations/novu.ts`.

The full self-hosted Novu stack has several moving parts and is best added after the base app and identity flow are stable. `infra/docker-compose.yml` includes Mailpit for local email testing.

## Workflows used by this app

When `NOVU_SECRET_KEY` is set, `apps/api-node` automatically:

- Calls `subscribers.identify` for each authenticated user the first time they hit `/me`. The `subscriberId` is the Keycloak `sub` (UUID).
- Triggers a workflow when `POST /uploads/:id/complete` succeeds.

### Workflow: `upload-created`

Create this workflow in Novu Cloud (Workflows → Create workflow → name it exactly `upload-created`).

**Trigger payload schema:**

```json
{
  "uploadId": "string",
  "filename": "string",
  "contentType": "string",
  "sizeBytes": "number"
}
```

**Recommended steps:**

| Step | Channel | Content |
| ---- | ------- | ------- |
| 1    | In-app  | `Your file {{payload.filename}} is ready.` |
| 2    | Email   | Subject: `Upload complete: {{payload.filename}}`. Body references `{{payload.uploadId}}` and `{{payload.contentType}}`. |

For local email testing point Novu's email provider at Mailpit (SMTP host `host.docker.internal`, port `1025`, no auth). The Mailpit UI is at <http://localhost:8025>.

### Disabling Novu

Leave `NOVU_SECRET_KEY` empty in `.env`. The Node API logs `novu: missing` in `/health` and all trigger calls become no-ops, so the rest of the app keeps working.
