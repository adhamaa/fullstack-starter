import 'dotenv/config'
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://app:app_password@localhost:5432/app_db',
  },
  strict: true,
  verbose: true,
} satisfies Config
