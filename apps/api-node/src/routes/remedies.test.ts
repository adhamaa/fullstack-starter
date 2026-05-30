import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestApp, type DbMockController } from './test-utils.js'

vi.mock('../db/index.js', async () => {
  const { createDbMock } = await import('./test-utils.js')
  return createDbMock()
})

import { db } from '../db/index.js'
import { remediesRouter } from './remedies.js'

const mock = db as unknown as DbMockController
const app = createTestApp('/remedies', remediesRouter)

const VALID_ID = '11111111-1111-4111-8111-111111111111'

const remedyListRow = {
  id: VALID_ID,
  name: 'Aconite',
  common_name: 'Monkshood',
  abbreviation: 'Acon',
  source: 'boericke',
  description: 'For sudden onset',
  characteristics: 'Restless, anxious',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
}

const remedyRow = {
  id: VALID_ID,
  name: 'Aconite',
  commonName: 'Monkshood',
  abbreviation: 'Acon',
  source: 'boericke',
  description: 'For sudden onset',
  characteristics: 'Restless, anxious',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
}

beforeEach(() => {
  mock.reset()
})

describe('GET /remedies', () => {
  it('returns 200 with the list envelope', async () => {
    mock.setResults([[remedyListRow], [{ total: 1 }]])

    const response = await request(app).get('/remedies')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      remedies: [remedyListRow],
      total: 1,
      limit: 50,
      offset: 0,
    })
  })

  it('parses pagination query params', async () => {
    mock.setResults([[], [{ total: 0 }]])

    const response = await request(app).get('/remedies?limit=5&offset=15')

    expect(response.status).toBe(200)
    expect(response.body.limit).toBe(5)
    expect(response.body.offset).toBe(15)
  })
})

describe('GET /remedies/:id', () => {
  it('returns 200 with the remedy DTO when found', async () => {
    mock.setResults([[remedyRow]])

    const response = await request(app).get(`/remedies/${VALID_ID}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual(remedyListRow)
  })

  it('returns 404 when the remedy is not found', async () => {
    mock.setResults([[]])

    const response = await request(app).get(`/remedies/${VALID_ID}`)

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Remedy not found' })
  })

  it('returns 400 for an invalid UUID', async () => {
    const response = await request(app).get('/remedies/not-a-uuid')

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('validation_error')
  })
})

describe('GET /remedies/:id/rates', () => {
  it('returns 200 with the rate DTO array', async () => {
    const rate = {
      id: VALID_ID,
      bank_id: VALID_ID,
      bank_name: 'Base Bank',
      value: '5678',
      rateable_type: 'remedy',
      rateable_id: VALID_ID,
      potency_variant: null,
      category: null,
      notes: null,
      source_page: null,
    }
    mock.setResults([[rate]])

    const response = await request(app).get(`/remedies/${VALID_ID}/rates`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual([rate])
  })
})

describe('POST /remedies/search', () => {
  it('returns 200 with the matches and a count', async () => {
    mock.setResults([[remedyListRow]])

    const response = await request(app).post('/remedies/search').send({ query: 'aconite' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ remedies: [remedyListRow], count: 1 })
  })

  it('returns 400 when the query is missing', async () => {
    const response = await request(app).post('/remedies/search').send({})

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('validation_error')
  })
})
