import { count, eq } from 'drizzle-orm'
import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db/index.js'
import { bodySystems, symptoms } from '../db/schema/index.js'
import {
  createSymptomSchema,
  paginationSchema,
  updateSymptomSchema,
  uuidParamSchema,
} from '../validation/domain.js'

export const symptomsRouter = Router()

const listQuerySchema = paginationSchema.extend({ body_system_id: z.string().uuid().optional() })

symptomsRouter.get('/', async (request, response) => {
  const { limit, offset, body_system_id } = listQuerySchema.parse(request.query)
  const conditions = body_system_id ? eq(symptoms.bodySystemId, body_system_id) : undefined

  const rows = await db
    .select({
      id: symptoms.id,
      body_system_id: symptoms.bodySystemId,
      description: symptoms.description,
      location: symptoms.location,
      modality: symptoms.modality,
      severity: symptoms.severity,
      body_system_name: bodySystems.name,
      created_at: symptoms.createdAt,
      updated_at: symptoms.updatedAt,
    })
    .from(symptoms)
    .leftJoin(bodySystems, eq(symptoms.bodySystemId, bodySystems.id))
    .where(conditions)
    .orderBy(bodySystems.name, symptoms.description)
    .limit(limit)
    .offset(offset)

  const [{ total }] = await db.select({ total: count() }).from(symptoms).where(conditions)

  response.json({ symptoms: rows, total, limit, offset })
})

symptomsRouter.get('/:id', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)

  const [row] = await db
    .select({
      id: symptoms.id,
      body_system_id: symptoms.bodySystemId,
      description: symptoms.description,
      location: symptoms.location,
      modality: symptoms.modality,
      severity: symptoms.severity,
      body_system_name: bodySystems.name,
      created_at: symptoms.createdAt,
      updated_at: symptoms.updatedAt,
    })
    .from(symptoms)
    .leftJoin(bodySystems, eq(symptoms.bodySystemId, bodySystems.id))
    .where(eq(symptoms.id, id))
    .limit(1)

  if (!row) {
    response.status(404).json({ error: 'Symptom not found' })
    return
  }

  response.json(row)
})

symptomsRouter.post('/', async (request, response) => {
  const body = createSymptomSchema.parse(request.body)
  const [row] = await db
    .insert(symptoms)
    .values({
      bodySystemId: body.body_system_id,
      description: body.description,
      location: body.location,
      modality: body.modality,
      severity: body.severity,
    })
    .returning()

  response.status(201).json(row)
})

symptomsRouter.put('/:id', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)
  const body = updateSymptomSchema.parse(request.body)

  const [row] = await db
    .update(symptoms)
    .set({
      ...(body.body_system_id !== undefined && { bodySystemId: body.body_system_id }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.modality !== undefined && { modality: body.modality }),
      ...(body.severity !== undefined && { severity: body.severity }),
      updatedAt: new Date(),
    })
    .where(eq(symptoms.id, id))
    .returning()

  if (!row) {
    response.status(404).json({ error: 'Symptom not found' })
    return
  }

  response.json(row)
})

symptomsRouter.delete('/:id', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)
  const [row] = await db.delete(symptoms).where(eq(symptoms.id, id)).returning({ id: symptoms.id })

  if (!row) {
    response.status(404).json({ error: 'Symptom not found' })
    return
  }

  response.json({ message: 'Symptom deleted successfully' })
})
