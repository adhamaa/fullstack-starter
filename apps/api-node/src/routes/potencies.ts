import { Router } from 'express'
import { db } from '../db/index.js'
import { potencies } from '../db/schema/index.js'

export const potenciesRouter = Router()

potenciesRouter.get('/', async (_request, response) => {
  const rows = await db.select().from(potencies).orderBy(potencies.scale, potencies.name)
  response.json(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      scale: row.scale,
      dilution_factor: row.dilutionFactor,
      description: row.description,
      created_at: row.createdAt,
    })),
  )
})
