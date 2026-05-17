import { describe, expect, it } from 'vitest'
import { resolveTemplateRef } from './template-ref.js'

describe('resolveTemplateRef', () => {
  it('uses TEMPLATE_TAG override as-is when prefixed with v', () => {
    expect(resolveTemplateRef('1.0.0', 'v2.0.0')).toBe('v2.0.0')
  })

  it('prefixes bare semver override with v', () => {
    expect(resolveTemplateRef('1.0.0', '1.2.3')).toBe('v1.2.3')
  })

  it('maps package semver to matching v tag', () => {
    expect(resolveTemplateRef('1.0.0')).toBe('v1.0.0')
  })

  it('falls back to main for unpublished 0.0.0', () => {
    expect(resolveTemplateRef('0.0.0')).toBe('main')
  })
})
