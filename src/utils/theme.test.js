import { afterEach, describe, expect, it, vi } from 'vitest'
import { getInitialTheme, THEME_STORAGE_KEY } from './theme'

describe('getInitialTheme', () => {
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('uses the saved theme preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))

    expect(getInitialTheme()).toBe('light')
  })

  it('uses the system preference when there is no saved theme', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))

    expect(getInitialTheme()).toBe('dark')
  })
})
