import { index, pgTable, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'
import { rateBanks } from './rate-banks.js'

export const rateableTypeEnum = ['remedy', 'formula'] as const
export type RateableType = (typeof rateableTypeEnum)[number]

export const radionicRates = pgTable(
  'radionic_rates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bankId: uuid('bank_id')
      .notNull()
      .references(() => rateBanks.id, { onDelete: 'cascade' }),
    value: varchar('value', { length: 64 }).notNull(),
    rateableType: varchar('rateable_type', { length: 20 }).notNull().$type<RateableType>(),
    rateableId: uuid('rateable_id').notNull(),
    potencyVariant: varchar('potency_variant', { length: 50 }),
    category: varchar('category', { length: 100 }),
    notes: text('notes'),
    sourcePage: varchar('source_page', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    unique('radionic_rates_bank_value_unique').on(table.bankId, table.value),
    index('radionic_rates_rateable_idx').on(table.rateableType, table.rateableId),
  ],
)

export type RadionicRateRow = typeof radionicRates.$inferSelect
export type NewRadionicRateRow = typeof radionicRates.$inferInsert
