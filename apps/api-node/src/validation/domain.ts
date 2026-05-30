import { z } from 'zod'

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const createRemedySchema = z.object({
  name: z.string().min(1).max(255),
  common_name: z.string().max(255).optional(),
  abbreviation: z.string().max(50).optional(),
  source: z.string().max(255).optional(),
  description: z.string().optional(),
  characteristics: z.string().optional(),
})

export const updateRemedySchema = createRemedySchema.partial()

export const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export const createSymptomSchema = z.object({
  body_system_id: z.string().uuid().optional(),
  description: z.string().min(1),
  location: z.string().max(255).optional(),
  modality: z.string().max(255).optional(),
  severity: z.string().max(50).optional(),
})

export const updateSymptomSchema = createSymptomSchema.partial()

export const createConditionSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
})

export const rateSearchSchema = z.object({
  bank: z.string().optional(),
  value: z.string().optional(),
  q: z.string().optional(),
  rateable_type: z.enum(['remedy', 'formula']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
})
