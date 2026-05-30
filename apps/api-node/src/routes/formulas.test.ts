import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestApp, type DbMockController } from './test-utils.js'

vi.mock('../db/index.js', async () => {
  const { createDbMock } = await import('./test-utils.js')
  return createDbMock()
})

import { db } from '../db/index.js'
import { formulasRouter } from './formulas.js'

const mock = db as unknown as DbMockController
const app = createTestApp('/formulas', formulasRouter)

const VALID_ID = '11111111-1111-4111-8111-111111111111'

const formulaRow = {
  id: VALID_ID,
  name: 'Calm Nerves',
  indication: 'Anxiety',
  description: 'A soothing formula',
  bodySystem: 'nervous',
  category: 'acute',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
}

const formulaDto = {
  id: VALID_ID,
  name: 'Calm Nerves',
  indication: 'Anxiety',
  description: 'A soothing formula',
  body_system: 'nervous',
  category: 'acute',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
}

beforeEach(() => {
  mock.reset()
})

describe('GET /formulas', () => {
  it('returns 200 with the list envelope', async () => {
    mock.setResults([[formulaRow], [{ total: 1 }]])

    const response = await request(app).get('/formulas')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      formulas: [formulaDto],
      total: 1,
      limit: 50,
      offset: 0,
    })
  })

  it('parses pagination query params', async () => {
    mock.setResults([[], [{ total: 0 }]])

    const response = await request(app).get('/formulas?limit=10&offset=20')

    expect(response.status).toBe(200)
    expect(response.body.limit).toBe(10)
    expect(response.body.offset).toBe(20)
  })

  it('rejects an out-of-range limit with 400', async () => {
    const response = await request(app).get('/formulas?limit=9999')

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('validation_error')
  })
})

describe('GET /formulas/:id', () => {
  it('returns 200 with the formula and its components when found', async () => {
    const component = {
      remedy_id: VALID_ID,
      remedy_name: 'Aconite',
      abbreviation: 'Acon',
      proportion: '1:1',
      notes: null,
    }
    mock.setResults([[formulaRow], [component]])

    const response = await request(app).get(`/formulas/${VALID_ID}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ...formulaDto, remedies: [component] })
  })

  it('returns 404 when the formula is not found', async () => {
    mock.setResults([[]])

    const response = await request(app).get(`/formulas/${VALID_ID}`)

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Formula not found' })
  })

  it('returns 400 for an invalid UUID', async () => {
    const response = await request(app).get('/formulas/not-a-uuid')

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('validation_error')
  })
})

describe('GET /formulas/:id/rates', () => {
  it('returns 200 with the rate DTO array', async () => {
    const rate = {
      id: VALID_ID,
      bank_id: VALID_ID,
      bank_name: 'Base Bank',
      value: '1234',
      rateable_type: 'formula',
      rateable_id: VALID_ID,
      potency_variant: null,
      category: null,
      notes: null,
      source_page: 12,
    }
    mock.setResults([[rate]])

    const response = await request(app).get(`/formulas/${VALID_ID}/rates`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual([rate])
  })

  it('returns 400 for an invalid UUID', async () => {
    const response = await request(app).get('/formulas/not-a-uuid/rates')

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('validation_error')
  })
})
