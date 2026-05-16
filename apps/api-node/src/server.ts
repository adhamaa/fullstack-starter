import cors from 'cors'
import express from 'express'
import { env } from './env.js'
import { checkDatabase } from './integrations/postgres.js'
import { getNovuStatus } from './integrations/novu.js'
import { checkRedis } from './integrations/redis.js'
import { checkS3 } from './integrations/s3.js'
import { authRouter } from './routes/auth.js'
import { meRouter } from './routes/me.js'
import { uploadsRouter } from './routes/uploads.js'

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

app.get('/health/flask', async (_request, response) => {
  const flaskResponse = await fetch(`${env.FLASK_API_URL}/health`)
  response.status(flaskResponse.status).json(await flaskResponse.json())
})

app.use(authRouter)
app.use(meRouter)
app.use(uploadsRouter)

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('[api-node] unhandled error:', error)
    response.status(500).json({ error: 'internal_server_error' })
  },
)

app.listen(env.NODE_API_PORT, () => {
  console.log(`Node API listening on http://localhost:${env.NODE_API_PORT}`)
})
