import { describe, expect, it, vi } from 'vitest'
import { createApiClient } from './index'
import { uploadFile } from './upload-intake'

describe('uploadFile', () => {
  it('presigns, PUTs via injected put, then completes', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          uploadId: '550e8400-e29b-41d4-a716-446655440000',
          key: 'users/sub/file.txt',
          url: 'https://storage.example/put',
          method: 'PUT',
          headers: { 'Content-Type': 'text/plain' },
          expiresAt: new Date().toISOString(),
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId: 'sub-1',
          key: 'users/sub/file.txt',
          filename: 'file.txt',
          contentType: 'text/plain',
          sizeBytes: 5,
          status: 'ready',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const put = vi.fn().mockResolvedValue(undefined)
    const client = createApiClient({ baseUrl: 'http://api.test', accessToken: 'tok' })
    const file = new Blob(['hello'], { type: 'text/plain' })

    const upload = await uploadFile(
      client,
      { file, filename: 'file.txt', contentType: 'text/plain' },
      { put },
    )

    expect(put).toHaveBeenCalledWith(
      'https://storage.example/put',
      { 'Content-Type': 'text/plain' },
      file,
    )
    expect(upload.status).toBe('ready')
    expect(fetchMock).toHaveBeenCalledTimes(2)

    vi.unstubAllGlobals()
  })
})

describe('createApiClient parse failures', () => {
  it('throws when me response does not match schema', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user: { id: '', roles: [] } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = createApiClient({ baseUrl: 'http://api.test', accessToken: 'tok' })
    await expect(client.me()).rejects.toThrow()

    vi.unstubAllGlobals()
  })

  it('throws when complete response does not match upload schema', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ notAnUpload: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = createApiClient({ baseUrl: 'http://api.test', accessToken: 'tok' })
    await expect(client.completeUpload('550e8400-e29b-41d4-a716-446655440000')).rejects.toThrow()

    vi.unstubAllGlobals()
  })
})
