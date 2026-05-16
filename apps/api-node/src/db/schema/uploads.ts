import { bigint, index, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const uploadStatusEnum = pgEnum('upload_status', ['pending', 'ready'])

export const uploads = pgTable(
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
    status: uploadStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdx: index('uploads_user_id_idx').on(table.userId),
  }),
)

export type UploadRow = typeof uploads.$inferSelect
export type NewUploadRow = typeof uploads.$inferInsert
