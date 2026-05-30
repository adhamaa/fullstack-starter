import cors from 'cors'
import express, { type Router } from 'express'
import { ZodError } from 'zod'

/**
 * A queue of result sets. Each awaited Drizzle query chain consumes the next
 * entry, mirroring the order of `await db...` calls inside a route handler.
 */
type ResultQueue = unknown[][]

type QueryChain = {
  from: (...args: unknown[]) => QueryChain
  where: (...args: unknown[]) => QueryChain
  orderBy: (...args: unknown[]) => QueryChain
  limit: (...args: unknown[]) => QueryChain
  offset: (...args: unknown[]) => QueryChain
  innerJoin: (...args: unknown[]) => QueryChain
  leftJoin: (...args: unknown[]) => QueryChain
  values: (...args: unknown[]) => QueryChain
  set: (...args: unknown[]) => QueryChain
  returning: (...args: unknown[]) => QueryChain
  then: (
    resolve: (value: unknown[]) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => Promise<unknown>
}

/**
 * The control surface the tests use to drive the mocked `db`. It is attached to
 * the same object that the routers import as `db`, so a single `vi.mock` of
 * `../db/index.js` is enough.
 */
export type DbMockController = {
  setResults: (results: ResultQueue) => void
  reset: () => void
}

function createChain(getNext: () => unknown[]): QueryChain {
  const chain: QueryChain = {
    from: () => chain,
    where: () => chain,
    orderBy: () => chain,
    limit: () => chain,
    offset: () => chain,
    innerJoin: () => chain,
    leftJoin: () => chain,
    values: () => chain,
    set: () => chain,
    returning: () => chain,
    // biome-ignore lint/suspicious/noThenProperty: intentional thenable that mimics Drizzle's awaitable query builder
    then: (resolve, reject) => Promise.resolve(getNext()).then(resolve, reject),
  }
  return chain
}

/**
 * Builds a chainable Drizzle stand-in. `select`/`insert`/`update`/`delete` all
 * return the same fluent chain; awaiting any chain resolves to the next queued
 * result set (or `[]` when the queue is empty).
 */
export function createDbMock() {
  let queue: ResultQueue = []
  const next = () => (queue.length > 0 ? (queue.shift() ?? []) : [])

  const db = {
    select: () => createChain(next),
    insert: () => createChain(next),
    update: () => createChain(next),
    delete: () => createChain(next),
    setResults: (results: ResultQueue) => {
      queue = results.map((rows) => [...rows])
    },
    reset: () => {
      queue = []
    },
  }

  return { db }
}

/**
 * Mounts a single router under `mountPath` on a fresh Express app that mirrors
 * the JSON body parser and the ZodError -> 400 error handler used in
 * `server.ts`, so validation behaviour matches production.
 */
export function createTestApp(mountPath: string, router: Router) {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '1mb' }))
  app.use(mountPath, router)
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
      response.status(500).json({ error: 'internal_server_error' })
    },
  )
  return app
}
