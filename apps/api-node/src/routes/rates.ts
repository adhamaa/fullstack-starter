import { and, count, eq, ilike, or, sql } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../db/index.js'
import { formulas, radionicRates, rateBanks, remedies } from '../db/schema/index.js'
import { paginationSchema, rateSearchSchema } from '../validation/domain.js'

export const ratesRouter = Router()

ratesRouter.get('/', async (request, response) => {
  const { limit, offset } = paginationSchema.parse(request.query)

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
    .orderBy(rateBanks.name, radionicRates.value)
    .limit(limit)
    .offset(offset)

  const [{ total }] = await db.select({ total: count() }).from(radionicRates)

  response.json({ rates: rows, total, limit, offset })
})

ratesRouter.get('/search', async (request, response) => {
  const { bank, value, q, rateable_type, limit, offset } = rateSearchSchema.parse(request.query)

  const filters = []
  if (bank) filters.push(or(eq(rateBanks.name, bank), ilike(rateBanks.name, `%${bank}%`)))
  if (value) filters.push(ilike(radionicRates.value, `%${value}%`))
  if (rateable_type) filters.push(eq(radionicRates.rateableType, rateable_type))
  if (q) {
    filters.push(
      or(
        ilike(radionicRates.value, `%${q}%`),
        ilike(radionicRates.notes, `%${q}%`),
        ilike(radionicRates.category, `%${q}%`),
        sql`exists (select 1 from remedies r where r.id = ${radionicRates.rateableId} and ${radionicRates.rateableType} = 'remedy' and r.name ilike ${`%${q}%`})`,
        sql`exists (select 1 from formulas f where f.id = ${radionicRates.rateableId} and ${radionicRates.rateableType} = 'formula' and f.name ilike ${`%${q}%`})`,
      ),
    )
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined

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
      entity_name: sql<string>`case when ${radionicRates.rateableType} = 'remedy' then (select name from remedies where id = ${radionicRates.rateableId}) else (select name from formulas where id = ${radionicRates.rateableId}) end`,
    })
    .from(radionicRates)
    .innerJoin(rateBanks, eq(radionicRates.bankId, rateBanks.id))
    .where(whereClause)
    .orderBy(rateBanks.name, radionicRates.value)
    .limit(limit)
    .offset(offset)

  response.json({ rates: rows, count: rows.length, limit, offset })
})

ratesRouter.get('/banks', async (_request, response) => {
  const rows = await db.select().from(rateBanks).orderBy(rateBanks.name)
  response.json(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      source_ref: row.sourceRef,
    })),
  )
})
