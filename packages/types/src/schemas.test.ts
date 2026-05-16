import { describe, expect, it } from 'vitest'
import { currentUserFromKeycloakClaims, uploadFromDb } from './mappers'
import { presignRequestSchema, uploadSchema } from './schemas'

describe('presignRequestSchema', () => {
  it('accepts a valid presign body', () => {
    const parsed = presignRequestSchema.parse({
      filename: 'report.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1024,
    })
    expect(parsed.filename).toBe('report.pdf')
  })

  it('rejects empty filename', () => {
    expect(() =>
      presignRequestSchema.parse({
        filename: '',
        contentType: 'application/pdf',
        sizeBytes: 1,
      }),
    ).toThrow()
  })
})

describe('uploadFromDb', () => {
  it('serializes dates to ISO strings', () => {
    const upload = uploadFromDb({
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'user-1',
      key: 'users/user-1/file.txt',
      filename: 'file.txt',
      contentType: 'text/plain',
      sizeBytes: 12,
      status: 'ready',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    })

    expect(upload.createdAt).toBe('2026-01-01T00:00:00.000Z')
    expect(uploadSchema.parse(upload)).toEqual(upload)
  })
})

describe('currentUserFromKeycloakClaims', () => {
  it('maps realm roles and display name', () => {
    const user = currentUserFromKeycloakClaims({
      sub: 'kc-sub-1',
      email: 'dev@example.com',
      given_name: 'Dev',
      family_name: 'User',
      realm_access: { roles: ['user', 'admin'] },
    })

    expect(user).toEqual({
      id: 'kc-sub-1',
      email: 'dev@example.com',
      name: 'Dev User',
      roles: ['user', 'admin'],
    })
  })

  it('throws when sub is missing', () => {
    expect(() => currentUserFromKeycloakClaims({ email: 'x@y.z' })).toThrow(
      'token missing sub claim',
    )
  })
})
