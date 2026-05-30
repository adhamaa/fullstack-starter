import { pgTable, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'
import { remedies } from './remedies.js'

export const formulas = pgTable('formulas', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  indication: text('indication'),
  description: text('description'),
  bodySystem: varchar('body_system', { length: 100 }),
  category: varchar('category', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const formulaRemedies = pgTable(
  'formula_remedies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    formulaId: uuid('formula_id')
      .notNull()
      .references(() => formulas.id, { onDelete: 'cascade' }),
    remedyId: uuid('remedy_id')
      .notNull()
      .references(() => remedies.id, { onDelete: 'cascade' }),
    proportion: varchar('proportion', { length: 50 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [unique().on(table.formulaId, table.remedyId)],
)

export type FormulaRow = typeof formulas.$inferSelect
export type FormulaRemedyRow = typeof formulaRemedies.$inferSelect
