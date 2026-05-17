import { describe, expect, it } from 'vitest'
import { needsRefresh, REFRESH_LEEWAY_MS, tokenSetFromOAuthResponse } from './tokens'

describe('needsRefresh', () => {
  it('is false when expiry is beyond leeway', () => {
    const now = 1_000_000
    const expiresAt = now + REFRESH_LEEWAY_MS + 1
    expect(needsRefresh(expiresAt, now)).toBe(false)
  })

  it('is true inside leeway window', () => {
    const now = 1_000_000
    const expiresAt = now + REFRESH_LEEWAY_MS - 1
    expect(needsRefresh(expiresAt, now)).toBe(true)
  })
})

describe('tokenSetFromOAuthResponse', () => {
  it('maps access token and expiry', () => {
    const before = Date.now()
    const set = tokenSetFromOAuthResponse({
      access_token: 'access',
      refresh_token: 'refresh',
      expires_in: 120,
    })
    expect(set.accessToken).toBe('access')
    expect(set.refreshToken).toBe('refresh')
    expect(set.accessTokenExpiresAt).toBeGreaterThanOrEqual(before + 120_000)
  })
})
