import cors from 'cors'
import express from 'express'
import { ZodError } from 'zod'
import { env } from './env.js'
import { getNovuStatus } from './integrations/novu.js'
import { checkDatabase } from './integrations/postgres.js'
import { checkRedis } from './integrations/redis.js'
import { checkS3 } from './integrations/s3.js'
import { conditionsRouter } from './routes/conditions.js'
import { formulasRouter } from './routes/formulas.js'
import { potenciesRouter } from './routes/potencies.js'
import { ratesRouter } from './routes/rates.js'
import { remediesRouter } from './routes/remedies.js'
import { symptomsRouter } from './routes/symptoms.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

async function dependencyStatus(check: () => Promise<void>) {
  try {
    await check()
    return 'ok' as const
  } catch {
    return 'error' as const
  }
}

app.get('/health', async (_request, response) => {
  const dependencies = {
    database: await dependencyStatus(checkDatabase),
    redis: await dependencyStatus(checkRedis),
    s3: await dependencyStatus(checkS3),
    novu: getNovuStatus(),
  }

  const overall = Object.values(dependencies).every(
    (value) => value === 'ok' || value === 'missing',
  )
    ? ('ok' as const)
    : ('degraded' as const)

  response.json({
    service: 'api-node',
    status: overall,
    timestamp: new Date().toISOString(),
    dependencies,
  })
})

app.use('/remedies', remediesRouter)
app.use('/symptoms', symptomsRouter)
app.use('/conditions', conditionsRouter)
app.use('/potencies', potenciesRouter)
app.use('/formulas', formulasRouter)
app.use('/rates', ratesRouter)

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof ZodError) {
      response.status(400).json({ error: 'validation_error', details: error.flatten() })
      return
    }

    console.error('[api-node] unhandled error:', error)
    response.status(500).json({ error: 'internal_server_error' })
  },
)

app.listen(env.NODE_API_PORT, () => {
  console.log(`Node API listening on http://localhost:${env.NODE_API_PORT}`)
})
