import type { z } from 'zod'
import type {
  ClinicalCondition,
  Formula,
  Potency,
  RadionicRate,
  RateBank,
  Remedy,
  Symptom,
} from './domain.js'
import {
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

export type CurrentUser = z.infer<typeof currentUserSchema>
export type { ClinicalCondition, Formula, Potency, RadionicRate, RateBank, Remedy, Symptom }
export type Upload = z.infer<typeof uploadSchema>
export type UploadStatus = z.infer<typeof uploadSchema>['status']
export type PresignRequest = z.infer<typeof presignRequestSchema>
export type PresignResponse = z.infer<typeof presignResponseSchema>
export type DownloadResponse = z.infer<typeof downloadResponseSchema>
export type HealthStatus = z.infer<typeof healthStatusSchema>

export {
  currentUserFromKeycloakClaims,
  type DbUploadRow,
  parseKeycloakAccessClaims,
  type UploadDbRow,
  uploadFromDb,
} from './mappers.js'

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
}

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
