import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestApp, type DbMockController } from './test-utils.js'

vi.mock('../db/index.js', async () => {
  const { createDbMock } = await import('./test-utils.js')
  return createDbMock()
})

import { db } from '../db/index.js'
import { conditionsRouter } from './conditions.js'

const mock = db as unknown as DbMockController
const app = createTestApp('/conditions', conditionsRouter)

const VALID_ID = '11111111-1111-4111-8111-111111111111'

const conditionRow = {
  id: VALID_ID,
  name: 'Migraine',
  description: 'Recurrent headache',
  category: 'neurological',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
}

const conditionDto = {
  id: VALID_ID,
  name: 'Migraine',
  description: 'Recurrent headache',
  category: 'neurological',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
}

beforeEach(() => {
  mock.reset()
})

describe('GET /conditions', () => {
  it('returns 200 with the list envelope', async () => {
    mock.setResults([[conditionRow], [{ total: 1 }]])

    const response = await request(app).get('/conditions')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      conditions: [conditionDto],
      total: 1,
      limit: 50,
      offset: 0,
    })
  })

  it('parses pagination query params', async () => {
    mock.setResults([[], [{ total: 0 }]])

    const response = await request(app).get('/conditions?limit=3&offset=6')

    expect(response.status).toBe(200)
    expect(response.body.limit).toBe(3)
    expect(response.body.offset).toBe(6)
  })
})

describe('GET /conditions/:id', () => {
  it('returns 200 with the condition and related remedies when found', async () => {
    const relatedRemedy = {
      id: VALID_ID,
      name: 'Belladonna',
      common_name: 'Deadly nightshade',
      abbreviation: 'Bell',
      indication_strength: 'strong',
      notes: null,
    }
    mock.setResults([[conditionRow], [relatedRemedy]])

    const response = await request(app).get(`/conditions/${VALID_ID}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ...conditionDto, remedies: [relatedRemedy] })
  })

  it('returns 404 when the condition is not found', async () => {
    mock.setResults([[]])

    const response = await request(app).get(`/conditions/${VALID_ID}`)

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Clinical condition not found' })
  })

  it('returns 400 for an invalid UUID', async () => {
    const response = await request(app).get('/conditions/not-a-uuid')

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('validation_error')
  })
})
