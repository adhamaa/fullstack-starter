import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  currentUserFromKeycloakClaims,
  type PresignRequest,
  type PresignResponse,
  parseKeycloakAccessClaims,
  presignRequestSchema,
  uploadFromDb,
} from '@radionic-homeopathy/types'
import { and, desc, eq, sql } from 'drizzle-orm'
import type { JWTPayload } from 'jose'
import { v4 as uuid } from 'uuid'
import { db } from '../db/index.js'
import { uploads, users } from '../db/schema/index.js'
import { env } from '../env.js'
import { identifySubscriber, triggerUploadCreated } from '../integrations/novu.js'
import { s3 } from '../integrations/s3.js'

export const PRESIGN_TTL_SECONDS = 60 * 15

export function buildObjectKey(sub: string, filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `users/${sub}/${Date.now()}-${uuid()}-${safe}`
}

export async function syncProfileFromClaims(claimsPayload: JWTPayload) {
  const claims = parseKeycloakAccessClaims(claimsPayload)
  const user = currentUserFromKeycloakClaims(claims)

  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.email ?? null,
      name: user.name,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: sql`excluded.email`,
        name: sql`excluded.name`,
        updatedAt: sql`now()`,
      },
    })

  return user
}

export async function presignUpload(
  sub: string,
  claimsPayload: JWTPayload,
  body: PresignRequest,
): Promise<PresignResponse> {
  await syncProfileFromClaims(claimsPayload)
  void identifySubscriber(claimsPayload)

  const id = uuid()
  const key = buildObjectKey(sub, body.filename)

  await db.insert(uploads).values({
    id,
    userId: sub,
    key,
    filename: body.filename,
    contentType: body.contentType,
    sizeBytes: body.sizeBytes,
    status: 'pending',
  })

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: body.contentType,
    }),
    { expiresIn: PRESIGN_TTL_SECONDS },
  )

  return {
    uploadId: id,
    key,
    url,
    method: 'PUT',
    headers: { 'Content-Type': body.contentType },
    expiresAt: new Date(Date.now() + PRESIGN_TTL_SECONDS * 1000).toISOString(),
  }
}

export class ObjectNotInStorageError extends Error {
  constructor(message = 'object not found in storage') {
    super(message)
    this.name = 'ObjectNotInStorageError'
  }
}

export async function objectExistsInStorage(key: string, client = s3): Promise<boolean> {
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      }),
    )
    return true
  } catch (error) {
    const name = (error as { name?: string }).name
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
    if (name === 'NotFound' || name === 'NoSuchKey' || status === 404) {
      return false
    }
    throw error
  }
}

export async function completeUpload(sub: string, uploadId: string, client = s3) {
  const [row] = await db
    .select()
    .from(uploads)
    .where(and(eq(uploads.id, uploadId), eq(uploads.userId, sub)))
    .limit(1)

  if (!row) {
    return { kind: 'not_found' as const }
  }

  if (row.status === 'ready') {
    return { kind: 'ok' as const, upload: uploadFromDb(row) }
  }

  const exists = await objectExistsInStorage(row.key, client)
  if (!exists) {
    return { kind: 'object_missing' as const, upload: uploadFromDb(row) }
  }

  const [updated] = await db
    .update(uploads)
    .set({ status: 'ready' })
    .where(eq(uploads.id, uploadId))
    .returning()

  void triggerUploadCreated(sub, {
    uploadId: row.id,
    filename: row.filename,
    contentType: row.contentType,
    sizeBytes: row.sizeBytes,
  })

  return { kind: 'ok' as const, upload: uploadFromDb(updated ?? { ...row, status: 'ready' }) }
}

export async function listUploads(sub: string) {
  const rows = await db
    .select()
    .from(uploads)
    .where(eq(uploads.userId, sub))
    .orderBy(desc(uploads.createdAt))
    .limit(100)

  return rows.map((row) => uploadFromDb(row))
}

export async function getDownloadUrl(sub: string, uploadId: string) {
  const [row] = await db
    .select()
    .from(uploads)
    .where(and(eq(uploads.id, uploadId), eq(uploads.userId, sub)))
    .limit(1)

  if (!row) return null

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: row.key,
      ResponseContentDisposition: `attachment; filename="${row.filename}"`,
    }),
    { expiresIn: PRESIGN_TTL_SECONDS },
  )

  return {
    uploadId: row.id,
    url,
    expiresAt: new Date(Date.now() + PRESIGN_TTL_SECONDS * 1000).toISOString(),
  }
}

export { presignRequestSchema }
