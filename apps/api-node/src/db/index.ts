import { drizzle } from 'drizzle-orm/mysql2'
import { mysqlPool } from '../integrations/mysql.js'
import * as schema from './schema/index.js'

export const db = drizzle(mysqlPool, { schema, mode: 'default' })

export { schema }
