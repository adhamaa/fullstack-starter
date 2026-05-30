import type { Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'
import { requireAuth } from './require-auth.js'

function mockRequest(authorization?: string): Request {
  return {
    header: (name: string) => (name.toLowerCase() === 'authorization' ? authorization : undefined),
  } as unknown as Request
}

function mockResponse() {
  const response = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
  }
  return response as unknown as Response & { statusCode: number; body: unknown }
}

describe('requireAuth', () => {
  it('responds 401 when the Authorization header is missing', async () => {
    const response = mockResponse()
    const next = vi.fn()

    await requireAuth(mockRequest(undefined), response, next)

    expect(next).not.toHaveBeenCalled()
    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({ error: 'missing bearer token' })
  })

  it('responds 401 when the Authorization header is not a Bearer token', async () => {
    const response = mockResponse()
    const next = vi.fn()

    await requireAuth(mockRequest('Basic abc123'), response, next)

    expect(next).not.toHaveBeenCalled()
    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({ error: 'missing bearer token' })
  })
})
