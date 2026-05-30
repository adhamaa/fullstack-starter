import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { remedies } from './remedies.js'

export const potencies = pgTable('potencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  scale: varchar('scale', { length: 20 }).notNull(),
  dilutionFactor: integer('dilution_factor'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const remedyPotencies = pgTable(
  'remedy_potencies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    remedyId: uuid('remedy_id')
      .notNull()
      .references(() => remedies.id, { onDelete: 'cascade' }),
    potencyId: uuid('potency_id')
      .notNull()
      .references(() => potencies.id, { onDelete: 'cascade' }),
    recommended: boolean('recommended').default(false),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [unique().on(table.remedyId, table.potencyId)],
)

export type PotencyRow = typeof potencies.$inferSelect
export type RemedyPotencyRow = typeof remedyPotencies.$inferSelect
