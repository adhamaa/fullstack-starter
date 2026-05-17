import type { UploadDbRow } from '@fullstack/types'
import { describe, expect, it } from 'vitest'
import type { UploadRow } from '../db/schema/uploads.js'

type AssertUploadRowCompatible = UploadRow extends UploadDbRow ? true : false

describe('UploadRow compatibility', () => {
  it('UploadRow satisfies UploadDbRow', () => {
    const check: AssertUploadRowCompatible = true
    expect(check).toBe(true)
  })
})
