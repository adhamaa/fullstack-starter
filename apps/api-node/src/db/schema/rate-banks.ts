import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const rateBanks = pgTable('rate_banks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  sourceRef: varchar('source_ref', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
})

export type RateBankRow = typeof rateBanks.$inferSelect
export type NewRateBankRow = typeof rateBanks.$inferInsert
