import { sql } from 'drizzle-orm'
import { check, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { remedies } from './remedies.js'

export const modalities = pgTable('modalities', {
  id: uuid('id').primaryKey().defaultRandom(),
  remedyId: uuid('remedy_id')
    .notNull()
    .references(() => remedies.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
})

export const mentalSymptoms = pgTable('mental_symptoms', {
  id: uuid('id').primaryKey().defaultRandom(),
  remedyId: uuid('remedy_id')
    .notNull()
    .references(() => remedies.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  intensity: varchar('intensity', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
})

export const remedyRelationships = pgTable(
  'remedy_relationships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    remedyId: uuid('remedy_id')
      .notNull()
      .references(() => remedies.id, { onDelete: 'cascade' }),
    relatedRemedyId: uuid('related_remedy_id')
      .notNull()
      .references(() => remedies.id, { onDelete: 'cascade' }),
    relationshipType: varchar('relationship_type', { length: 50 }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [check('remedy_not_self', sql`${table.remedyId} != ${table.relatedRemedyId}`)],
)

export type ModalityRow = typeof modalities.$inferSelect
export type MentalSymptomRow = typeof mentalSymptoms.$inferSelect
export type RemedyRelationshipRow = typeof remedyRelationships.$inferSelect
