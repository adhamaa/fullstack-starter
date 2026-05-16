import { drizzle } from 'drizzle-orm/node-postgres'
import { pgPool } from '../integrations/postgres.js'
import * as schema from './schema/index.js'

export const db = drizzle(pgPool, { schema })
