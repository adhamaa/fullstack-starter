import { drizzle } from 'drizzle-orm/mysql2'
import { migrate } from 'drizzle-orm/mysql2/migrator'
import mysql from 'mysql2/promise'
import { env } from '../env.js'

async function run() {
  const connection = await mysql.createConnection(env.DATABASE_URL)
  const db = drizzle(connection)

  console.log('Running migrations against', env.DATABASE_URL.replace(/:[^:@/]*@/, ':***@'))
  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('Migrations complete')

  await connection.end()
}

run().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
