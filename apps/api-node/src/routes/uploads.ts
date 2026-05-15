import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  presignRequestSchema,
  uploadFromDb,
  type PresignResponse,
} from '@fullstack/types'
import { and, desc, eq } from 'drizzle-orm'
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { db } from '../db/index.js'
import { uploads } from '../db/schema/index.js'
import { env } from '../env.js'
import { requireAuth } from '../integrations/keycloak.js'
import { triggerUploadCreated } from '../integrations/novu.js'
import { s3 } from '../integrations/s3.js'

export const uploadsRouter: Router = Router()

uploadsRouter.use(requireAuth)

const PRESIGN_TTL_SECONDS = 60 * 15

function userId(response: { locals: { user?: { sub?: string } } }) {
  const sub = response.locals.user?.sub
  if (!sub) throw new Error('requireAuth must populate response.locals.user')
  return sub
}

function buildObjectKey(sub: string, filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `users/${sub}/${Date.now()}-${uuid()}-${safe}`
}

uploadsRouter.post('/uploads/presign', async (request, response) => {
  const parsed = presignRequestSchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: 'invalid body', issues: parsed.error.issues })
    return
  }

  const sub = userId(response)
  const id = uuid()
  const key = buildObjectKey(sub, parsed.data.filename)

  await db.insert(uploads).values({
    id,
    userId: sub,
    key,
    filename: parsed.data.filename,
    contentType: parsed.data.contentType,
    sizeBytes: parsed.data.sizeBytes,
    status: 'pending',
  })

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: parsed.data.contentType,
    }),
    { expiresIn: PRESIGN_TTL_SECONDS },
  )

  const body: PresignResponse = {
    uploadId: id,
    key,
    url,
    method: 'PUT',
    headers: { 'Content-Type': parsed.data.contentType },
    expiresAt: new Date(Date.now() + PRESIGN_TTL_SECONDS * 1000).toISOString(),
  }

  response.json(body)
})

uploadsRouter.post('/uploads/:id/complete', async (request, response) => {
  const sub = userId(response)
  const id = request.params.id

  const [row] = await db
    .select()
    .from(uploads)
    .where(and(eq(uploads.id, id), eq(uploads.userId, sub)))
    .limit(1)

  if (!row) {
    response.status(404).json({ error: 'upload not found' })
    return
  }

  if (row.status !== 'ready') {
    await db.update(uploads).set({ status: 'ready' }).where(eq(uploads.id, id))
    void triggerUploadCreated(sub, {
      uploadId: row.id,
      filename: row.filename,
      contentType: row.contentType,
      sizeBytes: row.sizeBytes,
    })
  }

  response.json(uploadFromDb({ ...row, status: 'ready' }))
})

uploadsRouter.get('/uploads', async (_request, response) => {
  const sub = userId(response)
  const rows = await db
    .select()
    .from(uploads)
    .where(eq(uploads.userId, sub))
    .orderBy(desc(uploads.createdAt))
    .limit(100)

  response.json({ uploads: rows.map((row) => uploadFromDb(row)) })
})

uploadsRouter.get('/uploads/:id/download', async (request, response) => {
  const sub = userId(response)
  const [row] = await db
    .select()
    .from(uploads)
    .where(and(eq(uploads.id, request.params.id), eq(uploads.userId, sub)))
    .limit(1)

  if (!row) {
    response.status(404).json({ error: 'upload not found' })
    return
  }

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: row.key,
      ResponseContentDisposition: `attachment; filename="${row.filename}"`,
    }),
    { expiresIn: PRESIGN_TTL_SECONDS },
  )

  response.json({
    uploadId: row.id,
    url,
    expiresAt: new Date(Date.now() + PRESIGN_TTL_SECONDS * 1000).toISOString(),
  })
})
