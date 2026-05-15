import { z } from 'zod'

export const uploadStatusSchema = z.enum(['pending', 'ready'])

export const currentUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email().optional(),
  name: z.string().nullable().optional(),
  roles: z.array(z.string()),
})

export const meResponseSchema = z.object({
  user: currentUserSchema,
})

export const uploadSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  key: z.string().min(1),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  status: uploadStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const uploadsListResponseSchema = z.object({
  uploads: z.array(uploadSchema),
})

export const presignRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(127),
  sizeBytes: z
    .number()
    .int()
    .nonnegative()
    .max(50 * 1024 * 1024 * 1024),
})

export const presignResponseSchema = z.object({
  uploadId: z.string().uuid(),
  key: z.string().min(1),
  url: z.string().url(),
  method: z.literal('PUT'),
  headers: z.record(z.string(), z.string()),
  expiresAt: z.string().datetime(),
})

export const downloadResponseSchema = z.object({
  uploadId: z.string().uuid(),
  url: z.string().url(),
  expiresAt: z.string().datetime(),
})

export const healthStatusSchema = z.object({
  service: z.string(),
  status: z.enum(['ok', 'degraded']),
  timestamp: z.string().datetime(),
  dependencies: z
    .record(z.string(), z.enum(['ok', 'missing', 'error']))
    .optional(),
})

export const keycloakAccessClaimsSchema = z.object({
  sub: z.string().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  preferred_username: z.string().optional(),
  realm_access: z
    .object({
      roles: z.array(z.string()).optional(),
    })
    .optional(),
})
