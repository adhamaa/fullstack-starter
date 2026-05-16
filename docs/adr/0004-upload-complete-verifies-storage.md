# ADR-0004: Upload complete verifies object storage

## Status

Accepted

## Context

`POST /uploads/:id/complete` marked uploads `ready` in the database without checking object storage. Clients could call complete without a successful PUT, so list/download showed ready files that 404 or were missing. **Complete** is defined in [`CONTEXT.md`](../../CONTEXT.md) as the step that succeeds only when the file exists in storage.

## Decision

- **Complete** transitions an upload to `ready` only after a successful S3 `HeadObject` (or equivalent) for the upload’s object key.
- If the object is absent, respond with an error (e.g. `409` or `422`) and leave status `pending`.
- Novu `upload-created` (and any other side effects) run only after verification passes.
- Implement inside a dedicated Upload intake module in `api-node`, not inline in the route handler.

## Considered options

- **Trust the client** (status quo) — rejected: breaks the documented lifecycle and produces ghost ready uploads.
- **Env-gated verification** — rejected for this repo: two behaviours add test burden; local dev already runs MinIO via compose.

## Consequences

- Complete depends on S3/MinIO availability; failures surface as API errors instead of silent bad state.
- Integration tests should cover: object present → `ready`; object missing → error, still `pending`.
- Optional follow-up (out of scope here): compare stored size to presigned `sizeBytes`.
