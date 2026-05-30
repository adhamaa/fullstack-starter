import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const bodySystems = pgTable('body_systems', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type BodySystemRow = typeof bodySystems.$inferSelect
