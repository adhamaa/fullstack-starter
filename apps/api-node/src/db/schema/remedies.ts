import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const remedies = pgTable('remedies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  commonName: varchar('common_name', { length: 255 }),
  abbreviation: varchar('abbreviation', { length: 50 }),
  source: varchar('source', { length: 255 }),
  description: text('description'),
  characteristics: text('characteristics'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type RemedyRow = typeof remedies.$inferSelect
export type NewRemedyRow = typeof remedies.$inferInsert
