import { integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { remedies } from './remedies.js'

export const materiaMedicaSources = pgTable('materia_medica_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }),
  publicationYear: integer('publication_year'),
  isbn: varchar('isbn', { length: 20 }),
  edition: varchar('edition', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
})

export const remedySources = pgTable('remedy_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  remedyId: uuid('remedy_id')
    .notNull()
    .references(() => remedies.id, { onDelete: 'cascade' }),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => materiaMedicaSources.id, { onDelete: 'cascade' }),
  pageNumber: integer('page_number'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type MateriaMedicaSourceRow = typeof materiaMedicaSources.$inferSelect
export type RemedySourceRow = typeof remedySources.$inferSelect
