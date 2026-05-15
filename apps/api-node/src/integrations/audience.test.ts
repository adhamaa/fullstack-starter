import { describe, expect, it } from 'vitest'
import { isAudienceAllowed, normalizeAud } from './audience.js'

describe('normalizeAud', () => {
  it('wraps a string audience', () => {
    expect(normalizeAud('account')).toEqual(['account'])
  })

  it('filters non-string entries from arrays', () => {
    expect(normalizeAud(['fullstack-api', 1, 'account'])).toEqual(['fullstack-api', 'account'])
  })
})

describe('isAudienceAllowed', () => {
  const configured = ['fullstack-api', 'fullstack-web']

  it('allows account audience for configured clients', () => {
    expect(isAudienceAllowed('account', 'fullstack-web', configured)).toBe(true)
  })

  it('allows matching azp when aud is account only', () => {
    expect(isAudienceAllowed(['account'], 'fullstack-api', configured)).toBe(true)
  })

  it('rejects tokens whose aud and azp are outside the allow-list', () => {
    expect(isAudienceAllowed(['unknown-aud'], 'other-client', configured)).toBe(false)
  })

  it('allows all audiences when allow-list is empty', () => {
    expect(isAudienceAllowed('anything', undefined, [])).toBe(true)
  })
})
