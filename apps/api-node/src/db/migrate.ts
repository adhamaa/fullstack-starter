import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'
import { env } from '../env.js'

async function run() {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL })

  console.log('Running migrations against', env.DATABASE_URL.replace(/:[^:@/]*@/, ':***@'))
  await migrate(drizzle(pool), { migrationsFolder: './drizzle' })
  console.log('Migrations complete')

  await pool.end()
}

run().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
