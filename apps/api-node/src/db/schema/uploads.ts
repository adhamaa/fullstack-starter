import { bigint, index, mysqlEnum, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core'
import { users } from './users.js'

export const uploads = mysqlTable(
  'uploads',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    key: varchar('object_key', { length: 512 }).notNull(),
    filename: varchar('filename', { length: 255 }).notNull(),
    contentType: varchar('content_type', { length: 127 }).notNull(),
    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
    status: mysqlEnum('status', ['pending', 'ready']).default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index('uploads_user_id_idx').on(table.userId),
  }),
)

export type UploadRow = typeof uploads.$inferSelect
export type NewUploadRow = typeof uploads.$inferInsert
