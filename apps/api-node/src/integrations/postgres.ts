import pg from 'pg'
import { env } from '../env.js'

export const pgPool = new pg.Pool({ connectionString: env.DATABASE_URL })

export async function checkDatabase() {
  const client = await pgPool.connect()
  try {
    await client.query('SELECT 1')
  } finally {
    client.release()
  }
}
