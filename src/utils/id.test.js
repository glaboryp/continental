import { afterEach, describe, expect, it, vi } from 'vitest'
import { createId } from './id'

describe('createId', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses crypto.randomUUID when available', () => {
    const randomUUID = vi.fn(() => 'uuid')
    vi.stubGlobal('crypto', { randomUUID })

    expect(createId()).toBe('uuid')
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it('falls back to a generated ID when randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {})

    expect(createId()).toMatch(/^id-/)
  })
})
