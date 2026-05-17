import { describe, expect, it, vi } from 'vitest'
import { createApiClient } from './index'

describe('createApiClient', () => {
  it('sends bearer token from getToken on each request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user: { id: '1', roles: [] } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = createApiClient({
      baseUrl: 'http://api.test',
      getToken: async () => 'token-abc',
    })

    await client.me()

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/me',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    )

    const headers = fetchMock.mock.calls[0][1].headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer token-abc')

    vi.unstubAllGlobals()
  })

  it('throws ApiError with status when response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'invalid bearer token' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = createApiClient({ baseUrl: 'http://api.test', accessToken: 'bad' })

    await expect(client.me()).rejects.toMatchObject({ status: 401 })

    vi.unstubAllGlobals()
  })
})
