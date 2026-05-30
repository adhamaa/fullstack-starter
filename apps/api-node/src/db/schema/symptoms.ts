import { integer, pgTable, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'
import { bodySystems } from './body-systems.js'
import { remedies } from './remedies.js'

export const symptoms = pgTable('symptoms', {
  id: uuid('id').primaryKey().defaultRandom(),
  bodySystemId: uuid('body_system_id').references(() => bodySystems.id, { onDelete: 'set null' }),
  description: text('description').notNull(),
  location: varchar('location', { length: 255 }),
  modality: varchar('modality', { length: 255 }),
  severity: varchar('severity', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const remedySymptoms = pgTable(
  'remedy_symptoms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    remedyId: uuid('remedy_id')
      .notNull()
      .references(() => remedies.id, { onDelete: 'cascade' }),
    symptomId: uuid('symptom_id')
      .notNull()
      .references(() => symptoms.id, { onDelete: 'cascade' }),
    grade: integer('grade'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [unique().on(table.remedyId, table.symptomId)],
)

export type SymptomRow = typeof symptoms.$inferSelect
export type RemedySymptomRow = typeof remedySymptoms.$inferSelect
