import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestApp, type DbMockController } from './test-utils.js'

vi.mock('../db/index.js', async () => {
  const { createDbMock } = await import('./test-utils.js')
  return createDbMock()
})

import { db } from '../db/index.js'
import { symptomsRouter } from './symptoms.js'

const mock = db as unknown as DbMockController
const app = createTestApp('/symptoms', symptomsRouter)

const VALID_ID = '11111111-1111-4111-8111-111111111111'

const symptomRow = {
  id: VALID_ID,
  body_system_id: VALID_ID,
  description: 'Throbbing headache',
  location: 'head',
  modality: 'worse from light',
  severity: 'moderate',
  body_system_name: 'nervous',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
}

beforeEach(() => {
  mock.reset()
})

describe('GET /symptoms', () => {
  it('returns 200 with the list envelope', async () => {
    mock.setResults([[symptomRow], [{ total: 1 }]])

    const response = await request(app).get('/symptoms')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      symptoms: [symptomRow],
      total: 1,
      limit: 50,
      offset: 0,
    })
  })

  it('parses pagination query params', async () => {
    mock.setResults([[], [{ total: 0 }]])

    const response = await request(app).get('/symptoms?limit=25&offset=50')

    expect(response.status).toBe(200)
    expect(response.body.limit).toBe(25)
    expect(response.body.offset).toBe(50)
  })

  it('returns 400 when body_system_id is not a UUID', async () => {
    const response = await request(app).get('/symptoms?body_system_id=nope')

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('validation_error')
  })
})

describe('GET /symptoms/:id', () => {
  it('returns 200 with the symptom when found', async () => {
    mock.setResults([[symptomRow]])

    const response = await request(app).get(`/symptoms/${VALID_ID}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual(symptomRow)
  })

  it('returns 404 when the symptom is not found', async () => {
    mock.setResults([[]])

    const response = await request(app).get(`/symptoms/${VALID_ID}`)

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Symptom not found' })
  })

  it('returns 400 for an invalid UUID', async () => {
    const response = await request(app).get('/symptoms/not-a-uuid')

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('validation_error')
  })
})
