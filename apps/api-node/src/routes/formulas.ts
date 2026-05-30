import { and, count, eq } from 'drizzle-orm'
import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db/index.js'
import {
  formulaRemedies,
  formulas,
  radionicRates,
  rateBanks,
  remedies,
} from '../db/schema/index.js'
import { requireAuth } from '../middleware/require-auth.js'
import { createFormulaSchema, paginationSchema, uuidParamSchema } from '../validation/domain.js'

export const formulasRouter = Router()

const listQuerySchema = paginationSchema.extend({
  category: z.string().optional(),
  body_system: z.string().optional(),
})

formulasRouter.get('/', async (request, response) => {
  const { limit, offset, category, body_system } = listQuerySchema.parse(request.query)

  const filters = []
  if (category) filters.push(eq(formulas.category, category))
  if (body_system) filters.push(eq(formulas.bodySystem, body_system))
  const whereClause = filters.length > 0 ? and(...filters) : undefined

  const rows = await db
    .select()
    .from(formulas)
    .where(whereClause)
    .orderBy(formulas.name)
    .limit(limit)
    .offset(offset)

  const [{ total }] = await db.select({ total: count() }).from(formulas).where(whereClause)

  response.json({
    formulas: rows.map(toFormulaDto),
    total,
    limit,
    offset,
  })
})

/** Create a formula. Guarded: requires a valid Keycloak practitioner bearer token. */
formulasRouter.post('/', requireAuth, async (request, response) => {
  const body = createFormulaSchema.parse(request.body)

  const [created] = await db
    .insert(formulas)
    .values({
      name: body.name,
      indication: body.indication,
      description: body.description,
      bodySystem: body.body_system,
      category: body.category,
    })
    .returning()

  response.status(201).json(toFormulaDto(created))
})

formulasRouter.get('/:id/rates', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)

  const rows = await db
    .select({
      id: radionicRates.id,
      bank_id: radionicRates.bankId,
      bank_name: rateBanks.name,
      value: radionicRates.value,
      rateable_type: radionicRates.rateableType,
      rateable_id: radionicRates.rateableId,
      potency_variant: radionicRates.potencyVariant,
      category: radionicRates.category,
      notes: radionicRates.notes,
      source_page: radionicRates.sourcePage,
    })
    .from(radionicRates)
    .innerJoin(rateBanks, eq(radionicRates.bankId, rateBanks.id))
    .where(and(eq(radionicRates.rateableType, 'formula'), eq(radionicRates.rateableId, id)))

  response.json(rows)
})

formulasRouter.get('/:id', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)
  const [formula] = await db.select().from(formulas).where(eq(formulas.id, id)).limit(1)

  if (!formula) {
    response.status(404).json({ error: 'Formula not found' })
    return
  }

  const components = await db
    .select({
      remedy_id: remedies.id,
      remedy_name: remedies.name,
      abbreviation: remedies.abbreviation,
      proportion: formulaRemedies.proportion,
      notes: formulaRemedies.notes,
    })
    .from(formulaRemedies)
    .innerJoin(remedies, eq(formulaRemedies.remedyId, remedies.id))
    .where(eq(formulaRemedies.formulaId, id))

  response.json({ ...toFormulaDto(formula), remedies: components })
})

function toFormulaDto(row: typeof formulas.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    indication: row.indication,
    description: row.description,
    body_system: row.bodySystem,
    category: row.category,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }
}
