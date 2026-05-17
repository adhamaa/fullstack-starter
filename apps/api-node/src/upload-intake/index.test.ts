import { describe, expect, it, vi } from 'vitest'
import { completeUpload, objectExistsInStorage, syncProfileFromClaims } from './index.js'

vi.mock('../db/index.js', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              userId: 'sub-1',
              key: 'users/sub-1/file.txt',
              filename: 'file.txt',
              contentType: 'text/plain',
              sizeBytes: 10,
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              userId: 'sub-1',
              key: 'users/sub-1/file.txt',
              filename: 'file.txt',
              contentType: 'text/plain',
              sizeBytes: 10,
              status: 'ready',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        })),
      })),
    })),
  },
}))

vi.mock('../integrations/novu.js', () => ({
  identifySubscriber: vi.fn(),
  triggerUploadCreated: vi.fn(),
}))

describe('objectExistsInStorage', () => {
  it('returns false when HeadObject reports NotFound', async () => {
    const client = {
      send: vi.fn().mockRejectedValue({ name: 'NotFound' }),
    }
    await expect(objectExistsInStorage('missing-key', client as never)).resolves.toBe(false)
  })

  it('returns true when HeadObject succeeds', async () => {
    const client = {
      send: vi.fn().mockResolvedValue({}),
    }
    await expect(objectExistsInStorage('present-key', client as never)).resolves.toBe(true)
  })
})

describe('completeUpload', () => {
  it('rejects when the S3 object is missing', async () => {
    const client = {
      send: vi.fn().mockRejectedValue({ name: 'NotFound' }),
    }

    const result = await completeUpload(
      'sub-1',
      '550e8400-e29b-41d4-a716-446655440000',
      client as never,
    )
    expect(result.kind).toBe('object_missing')
    if (result.kind === 'object_missing') {
      expect(result.upload.status).toBe('pending')
    }
  })
})

describe('syncProfileFromClaims', () => {
  it('upserts a user row from token claims', async () => {
    const { db } = await import('../db/index.js')
    await syncProfileFromClaims({
      sub: 'sub-abc',
      email: 'demo@example.com',
      name: 'Demo User',
      realm_access: { roles: ['user'] },
    })

    expect(db.insert).toHaveBeenCalled()
  })
})
