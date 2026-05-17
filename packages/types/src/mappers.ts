import type { z } from 'zod'
import { currentUserSchema, keycloakAccessClaimsSchema, uploadSchema } from './schemas.js'

type KeycloakAccessClaims = z.infer<typeof keycloakAccessClaimsSchema>

/** Row shape for `uploads` table rows passed into `uploadFromDb`. */
export type UploadDbRow = {
  id: string
  userId: string
  key: string
  filename: string
  contentType: string
  sizeBytes: number
  status: 'pending' | 'ready'
  createdAt: Date | string
  updatedAt: Date | string
}

/** @deprecated Use `UploadDbRow`. */
export type DbUploadRow = UploadDbRow

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

export function uploadFromDb(row: UploadDbRow) {
  return uploadSchema.parse({
    id: row.id,
    userId: row.userId,
    key: row.key,
    filename: row.filename,
    contentType: row.contentType,
    sizeBytes: row.sizeBytes,
    status: row.status,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
  })
}

export function currentUserFromKeycloakClaims(claims: KeycloakAccessClaims) {
  if (!claims.sub) {
    throw new Error('token missing sub claim')
  }

  const fullName = [claims.given_name, claims.family_name].filter(Boolean).join(' ').trim()
  const displayName = claims.name ?? (fullName || claims.preferred_username || null)

  return currentUserSchema.parse({
    id: claims.sub,
    email: claims.email,
    name: displayName,
    roles: claims.realm_access?.roles ?? [],
  })
}

export function parseKeycloakAccessClaims(payload: unknown) {
  return keycloakAccessClaimsSchema.parse(payload)
}
