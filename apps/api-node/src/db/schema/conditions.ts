import { pgTable, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'
import { remedies } from './remedies.js'

export const clinicalConditions = pgTable('clinical_conditions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const remedyConditions = pgTable(
  'remedy_conditions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    remedyId: uuid('remedy_id')
      .notNull()
      .references(() => remedies.id, { onDelete: 'cascade' }),
    conditionId: uuid('condition_id')
      .notNull()
      .references(() => clinicalConditions.id, { onDelete: 'cascade' }),
    indicationStrength: varchar('indication_strength', { length: 50 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [unique().on(table.remedyId, table.conditionId)],
)

export type ClinicalConditionRow = typeof clinicalConditions.$inferSelect
export type RemedyConditionRow = typeof remedyConditions.$inferSelect
