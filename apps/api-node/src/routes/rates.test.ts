import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestApp, type DbMockController } from './test-utils.js'

vi.mock('../db/index.js', async () => {
  const { createDbMock } = await import('./test-utils.js')
  return createDbMock()
})

import { db } from '../db/index.js'
import { ratesRouter } from './rates.js'

const mock = db as unknown as DbMockController
const app = createTestApp('/rates', ratesRouter)

const VALID_ID = '11111111-1111-4111-8111-111111111111'

const rateRow = {
  id: VALID_ID,
  bank_id: VALID_ID,
  bank_name: 'Base Bank',
  value: '1234',
  rateable_type: 'remedy',
  rateable_id: VALID_ID,
  potency_variant: null,
  category: null,
  notes: null,
  source_page: 7,
}

beforeEach(() => {
  mock.reset()
})

describe('GET /rates', () => {
  it('returns 200 with the list envelope', async () => {
    mock.setResults([[rateRow], [{ total: 1 }]])

    const response = await request(app).get('/rates')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      rates: [rateRow],
      total: 1,
      limit: 50,
      offset: 0,
    })
  })

  it('parses pagination query params', async () => {
    mock.setResults([[], [{ total: 0 }]])

    const response = await request(app).get('/rates?limit=2&offset=4')

    expect(response.status).toBe(200)
    expect(response.body.limit).toBe(2)
    expect(response.body.offset).toBe(4)
  })

  it('rejects an out-of-range limit with 400', async () => {
    const response = await request(app).get('/rates?limit=0')

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('validation_error')
  })
})

describe('GET /rates/search', () => {
  it('returns 200 with matches, a count and pagination', async () => {
    const searchRow = { ...rateRow, entity_name: 'Aconite' }
    mock.setResults([[searchRow]])

    const response = await request(app).get('/rates/search?q=acon')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      rates: [searchRow],
      count: 1,
      limit: 50,
      offset: 0,
    })
  })

  it('returns 400 for an invalid rateable_type', async () => {
    const response = await request(app).get('/rates/search?rateable_type=plant')

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('validation_error')
  })
})

describe('GET /rates/banks', () => {
  it('returns 200 with the mapped bank array', async () => {
    const bankRow = {
      id: VALID_ID,
      name: 'Base Bank',
      description: 'Default bank',
      sourceRef: 'p.1',
    }
    mock.setResults([[bankRow]])

    const response = await request(app).get('/rates/banks')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([
      { id: VALID_ID, name: 'Base Bank', description: 'Default bank', source_ref: 'p.1' },
    ])
  })
})
