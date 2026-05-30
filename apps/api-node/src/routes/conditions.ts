import { count, eq } from 'drizzle-orm'
import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db/index.js'
import { clinicalConditions, remedies, remedyConditions } from '../db/schema/index.js'
import { createConditionSchema, paginationSchema, uuidParamSchema } from '../validation/domain.js'

export const conditionsRouter = Router()

const listQuerySchema = paginationSchema.extend({ category: z.string().optional() })

conditionsRouter.get('/', async (request, response) => {
  const { limit, offset, category } = listQuerySchema.parse(request.query)
  const conditions = category ? eq(clinicalConditions.category, category) : undefined

  const rows = await db
    .select()
    .from(clinicalConditions)
    .where(conditions)
    .orderBy(clinicalConditions.name)
    .limit(limit)
    .offset(offset)

  const [{ total }] = await db.select({ total: count() }).from(clinicalConditions).where(conditions)

  response.json({
    conditions: rows.map(toConditionDto),
    total,
    limit,
    offset,
  })
})

conditionsRouter.get('/:id', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)
  const [row] = await db
    .select()
    .from(clinicalConditions)
    .where(eq(clinicalConditions.id, id))
    .limit(1)

  if (!row) {
    response.status(404).json({ error: 'Clinical condition not found' })
    return
  }

  const remedyRows = await db
    .select({
      id: remedies.id,
      name: remedies.name,
      common_name: remedies.commonName,
      abbreviation: remedies.abbreviation,
      indication_strength: remedyConditions.indicationStrength,
      notes: remedyConditions.notes,
    })
    .from(remedies)
    .innerJoin(remedyConditions, eq(remedies.id, remedyConditions.remedyId))
    .where(eq(remedyConditions.conditionId, id))
    .orderBy(remedyConditions.indicationStrength, remedies.name)

  response.json({ ...toConditionDto(row), remedies: remedyRows })
})

conditionsRouter.post('/', async (request, response) => {
  const body = createConditionSchema.parse(request.body)
  const [row] = await db
    .insert(clinicalConditions)
    .values({
      name: body.name,
      description: body.description,
      category: body.category,
    })
    .returning()

  response.status(201).json(toConditionDto(row))
})

function toConditionDto(row: typeof clinicalConditions.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }
}
