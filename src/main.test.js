import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

async function mountMain() {
  document.body.innerHTML = '<div id="app"></div>'
  localStorage.clear()
  vi.resetModules()

  const game = await import('./stores/game.js')
  await import('./main.js')

  return {
    store: game.useGameStore(),
    storageKey: game.STORAGE_KEY,
  }
}

describe('main', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('mounts the application and persists game state', async () => {
    const { store, storageKey } = await mountMain()

    expect(document.querySelector('#app .sheet')).not.toBeNull()

    store.players.push({ id: 'ana', name: 'Ana' })
    await nextTick()

    expect(JSON.parse(localStorage.getItem(storageKey))).toMatchObject({
      players: [{ id: 'ana', name: 'Ana' }],
    })
  })

  it('keeps the mounted application usable when localStorage persistence throws', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage full')
    })
    const { store } = await mountMain()

    expect(() => {
      store.players.push({ id: 'ana', name: 'Ana' })
    }).not.toThrow()
    await nextTick()

    expect(document.querySelector('#app .sheet')).not.toBeNull()
    expect(setItem).toHaveBeenCalled()
  })
})
