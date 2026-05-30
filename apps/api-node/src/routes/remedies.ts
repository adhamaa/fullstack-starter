import { and, count, desc, eq, sql } from 'drizzle-orm'
import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db/index.js'
import {
  bodySystems,
  clinicalConditions,
  modalities,
  mentalSymptoms,
  potencies,
  radionicRates,
  rateBanks,
  remedyConditions,
  remedyPotencies,
  remedyRelationships,
  remedySymptoms,
  remedies,
  symptoms,
} from '../db/schema/index.js'
import {
  createRemedySchema,
  paginationSchema,
  searchSchema,
  updateRemedySchema,
  uuidParamSchema,
} from '../validation/domain.js'

export const remediesRouter = Router()

const listQuerySchema = paginationSchema.extend({ source: z.string().optional() })

remediesRouter.get('/', async (request, response) => {
  const { limit, offset, source } = listQuerySchema.parse(request.query)
  const conditions = source ? eq(remedies.source, source) : undefined

  const rows = await db
    .select({
      id: remedies.id,
      name: remedies.name,
      common_name: remedies.commonName,
      abbreviation: remedies.abbreviation,
      source: remedies.source,
      description: remedies.description,
      characteristics: remedies.characteristics,
      created_at: remedies.createdAt,
      updated_at: remedies.updatedAt,
    })
    .from(remedies)
    .where(conditions)
    .orderBy(remedies.name)
    .limit(limit)
    .offset(offset)

  const [{ total }] = await db.select({ total: count() }).from(remedies).where(conditions)

  response.json({ remedies: rows, total, limit, offset })
})

remediesRouter.post('/search', async (request, response) => {
  const body = searchSchema.parse(request.body)

  const rows = await db
    .select({
      id: remedies.id,
      name: remedies.name,
      common_name: remedies.commonName,
      abbreviation: remedies.abbreviation,
      source: remedies.source,
      description: remedies.description,
      characteristics: remedies.characteristics,
      created_at: remedies.createdAt,
      updated_at: remedies.updatedAt,
    })
    .from(remedies)
    .where(
      sql`to_tsvector('english', ${remedies.name} || ' ' || coalesce(${remedies.commonName}, '') || ' ' || coalesce(${remedies.description}, '')) @@ plainto_tsquery('english', ${body.query})`,
    )
    .orderBy(
      desc(
        sql`ts_rank(to_tsvector('english', ${remedies.name} || ' ' || coalesce(${remedies.commonName}, '') || ' ' || coalesce(${remedies.description}, '')), plainto_tsquery('english', ${body.query}))`,
      ),
    )
    .limit(body.limit)
    .offset(body.offset)

  response.json({ remedies: rows, count: rows.length })
})

remediesRouter.get('/:id/details', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)
  const [remedy] = await db.select().from(remedies).where(eq(remedies.id, id)).limit(1)

  if (!remedy) {
    response.status(404).json({ error: 'Remedy not found' })
    return
  }

  const symptomRows = await db
    .select({
      id: symptoms.id,
      body_system_id: symptoms.bodySystemId,
      description: symptoms.description,
      location: symptoms.location,
      modality: symptoms.modality,
      severity: symptoms.severity,
      grade: remedySymptoms.grade,
      remedy_notes: remedySymptoms.notes,
      body_system_name: bodySystems.name,
      created_at: symptoms.createdAt,
      updated_at: symptoms.updatedAt,
    })
    .from(symptoms)
    .innerJoin(remedySymptoms, eq(symptoms.id, remedySymptoms.symptomId))
    .leftJoin(bodySystems, eq(symptoms.bodySystemId, bodySystems.id))
    .where(eq(remedySymptoms.remedyId, id))
    .orderBy(desc(remedySymptoms.grade), symptoms.description)

  const modalityRows = await db
    .select()
    .from(modalities)
    .where(eq(modalities.remedyId, id))
    .orderBy(modalities.type, modalities.category)

  const mentalRows = await db
    .select()
    .from(mentalSymptoms)
    .where(eq(mentalSymptoms.remedyId, id))

  const potencyRows = await db
    .select({
      id: potencies.id,
      name: potencies.name,
      scale: potencies.scale,
      dilution_factor: potencies.dilutionFactor,
      description: potencies.description,
      recommended: remedyPotencies.recommended,
      notes: remedyPotencies.notes,
      created_at: potencies.createdAt,
    })
    .from(potencies)
    .innerJoin(remedyPotencies, eq(potencies.id, remedyPotencies.potencyId))
    .where(eq(remedyPotencies.remedyId, id))
    .orderBy(potencies.scale, potencies.name)

  response.json({
    ...toRemedyDto(remedy),
    symptoms: symptomRows,
    modalities: modalityRows.map((m) => ({
      id: m.id,
      remedy_id: m.remedyId,
      type: m.type,
      description: m.description,
      category: m.category,
      created_at: m.createdAt,
    })),
    mental_symptoms: mentalRows.map((m) => ({
      id: m.id,
      remedy_id: m.remedyId,
      description: m.description,
      intensity: m.intensity,
      created_at: m.createdAt,
    })),
    potencies: potencyRows,
  })
})

remediesRouter.get('/:id/symptoms', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)

  const rows = await db
    .select({
      id: symptoms.id,
      body_system_id: symptoms.bodySystemId,
      description: symptoms.description,
      location: symptoms.location,
      modality: symptoms.modality,
      severity: symptoms.severity,
      grade: remedySymptoms.grade,
      remedy_notes: remedySymptoms.notes,
      body_system_name: bodySystems.name,
      created_at: symptoms.createdAt,
      updated_at: symptoms.updatedAt,
    })
    .from(symptoms)
    .innerJoin(remedySymptoms, eq(symptoms.id, remedySymptoms.symptomId))
    .leftJoin(bodySystems, eq(symptoms.bodySystemId, bodySystems.id))
    .where(eq(remedySymptoms.remedyId, id))

  response.json(rows)
})

remediesRouter.get('/:id/conditions', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)

  const rows = await db
    .select({
      id: clinicalConditions.id,
      name: clinicalConditions.name,
      description: clinicalConditions.description,
      category: clinicalConditions.category,
      indication_strength: remedyConditions.indicationStrength,
      notes: remedyConditions.notes,
      created_at: clinicalConditions.createdAt,
      updated_at: clinicalConditions.updatedAt,
    })
    .from(clinicalConditions)
    .innerJoin(remedyConditions, eq(clinicalConditions.id, remedyConditions.conditionId))
    .where(eq(remedyConditions.remedyId, id))

  response.json(rows)
})

remediesRouter.get('/:id/relationships', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)

  const rows = await db
    .select({
      id: remedies.id,
      name: remedies.name,
      common_name: remedies.commonName,
      abbreviation: remedies.abbreviation,
      relationship_type: remedyRelationships.relationshipType,
      notes: remedyRelationships.notes,
    })
    .from(remedies)
    .innerJoin(remedyRelationships, eq(remedies.id, remedyRelationships.relatedRemedyId))
    .where(eq(remedyRelationships.remedyId, id))

  response.json(rows)
})

remediesRouter.get('/:id/rates', async (request, response) => {
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
    .where(and(eq(radionicRates.rateableType, 'remedy'), eq(radionicRates.rateableId, id)))

  response.json(rows)
})

remediesRouter.get('/:id', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)
  const [row] = await db.select().from(remedies).where(eq(remedies.id, id)).limit(1)

  if (!row) {
    response.status(404).json({ error: 'Remedy not found' })
    return
  }

  response.json(toRemedyDto(row))
})

remediesRouter.post('/', async (request, response) => {
  const body = createRemedySchema.parse(request.body)
  const [row] = await db
    .insert(remedies)
    .values({
      name: body.name,
      commonName: body.common_name,
      abbreviation: body.abbreviation,
      source: body.source,
      description: body.description,
      characteristics: body.characteristics,
    })
    .returning()

  response.status(201).json(toRemedyDto(row))
})

remediesRouter.put('/:id', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)
  const body = updateRemedySchema.parse(request.body)

  const [row] = await db
    .update(remedies)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.common_name !== undefined && { commonName: body.common_name }),
      ...(body.abbreviation !== undefined && { abbreviation: body.abbreviation }),
      ...(body.source !== undefined && { source: body.source }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.characteristics !== undefined && { characteristics: body.characteristics }),
      updatedAt: new Date(),
    })
    .where(eq(remedies.id, id))
    .returning()

  if (!row) {
    response.status(404).json({ error: 'Remedy not found' })
    return
  }

  response.json(toRemedyDto(row))
})

remediesRouter.delete('/:id', async (request, response) => {
  const { id } = uuidParamSchema.parse(request.params)
  const [row] = await db.delete(remedies).where(eq(remedies.id, id)).returning({ id: remedies.id })

  if (!row) {
    response.status(404).json({ error: 'Remedy not found' })
    return
  }

  response.json({ message: 'Remedy deleted successfully' })
})

function toRemedyDto(row: typeof remedies.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    common_name: row.commonName,
    abbreviation: row.abbreviation,
    source: row.source,
    description: row.description,
    characteristics: row.characteristics,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }
}
