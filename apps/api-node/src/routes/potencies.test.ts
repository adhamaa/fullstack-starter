import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestApp, type DbMockController } from './test-utils.js'

vi.mock('../db/index.js', async () => {
  const { createDbMock } = await import('./test-utils.js')
  return createDbMock()
})

import { db } from '../db/index.js'
import { potenciesRouter } from './potencies.js'

const mock = db as unknown as DbMockController
const app = createTestApp('/potencies', potenciesRouter)

const VALID_ID = '11111111-1111-4111-8111-111111111111'

const potencyRow = {
  id: VALID_ID,
  name: '30C',
  scale: 'C',
  dilutionFactor: '100',
  description: 'Centesimal 30',
  createdAt: '2024-01-01T00:00:00.000Z',
}

const potencyDto = {
  id: VALID_ID,
  name: '30C',
  scale: 'C',
  dilution_factor: '100',
  description: 'Centesimal 30',
  created_at: '2024-01-01T00:00:00.000Z',
}

beforeEach(() => {
  mock.reset()
})

describe('GET /potencies', () => {
  it('returns 200 with the mapped potency array', async () => {
    mock.setResults([[potencyRow]])

    const response = await request(app).get('/potencies')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([potencyDto])
  })

  it('returns 200 with an empty array when there are no potencies', async () => {
    mock.setResults([[]])

    const response = await request(app).get('/potencies')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })
})
