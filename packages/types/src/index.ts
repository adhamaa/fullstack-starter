import type { z } from 'zod'
import {
  currentUserSchema,
  downloadResponseSchema,
  healthStatusSchema,
  meResponseSchema,
  presignRequestSchema,
  presignResponseSchema,
  uploadSchema,
  uploadsListResponseSchema,
} from './schemas.js'

export type CurrentUser = z.infer<typeof currentUserSchema>
export type Upload = z.infer<typeof uploadSchema>
export type UploadStatus = z.infer<typeof uploadSchema>['status']
export type PresignRequest = z.infer<typeof presignRequestSchema>
export type PresignResponse = z.infer<typeof presignResponseSchema>
export type DownloadResponse = z.infer<typeof downloadResponseSchema>
export type HealthStatus = z.infer<typeof healthStatusSchema>

export {
  currentUserSchema,
  downloadResponseSchema,
  healthStatusSchema,
  keycloakAccessClaimsSchema,
  meResponseSchema,
  presignRequestSchema,
  presignResponseSchema,
  uploadSchema,
  uploadStatusSchema,
  uploadsListResponseSchema,
} from './schemas.js'

export {
  currentUserFromKeycloakClaims,
  parseKeycloakAccessClaims,
  uploadFromDb,
  type DbUploadRow,
} from './mappers.js'

export function parseMeResponse(body: unknown) {
  return meResponseSchema.parse(body)
}

export function parseUpload(body: unknown) {
  return uploadSchema.parse(body)
}

export function parseUploadsListResponse(body: unknown) {
  return uploadsListResponseSchema.parse(body)
}

export function parsePresignResponse(body: unknown) {
  return presignResponseSchema.parse(body)
}

export function parseDownloadResponse(body: unknown) {
  return downloadResponseSchema.parse(body)
}
