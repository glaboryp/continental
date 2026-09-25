import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PodiumView from './PodiumView.vue'
import { useGameStore } from '../stores/game'

function mountPodium({ withRest = true } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useGameStore()
  store.players = [
    { id: 'ana', name: 'Ana' },
    { id: 'luis', name: 'Luis' },
    { id: 'carmen', name: 'Carmen' },
    ...(withRest ? [{ id: 'eva', name: 'Eva' }] : []),
  ]
  store.rounds = [{ id: 'final', name: 'Final', cards: 7 }]
  store.scores = {
    final: withRest
      ? { ana: 5, luis: 5, carmen: 7, eva: 10 }
      : { ana: 5, luis: 10, carmen: 12 },
  }
  store.phase = 'podium'

  return {
    store,
    wrapper: mount(PodiumView, { global: { plugins: [pinia] } }),
  }
}

describe('PodiumView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('orders tied podium places and renders players outside the podium', () => {
    const { wrapper } = mountPodium()

    expect(wrapper.findAll('.podium-slot').map((node) => node.text())).toEqual([
      '1ºAna5 pts',
      '1ºLuis5 pts',
      '3ºCarmen7 pts',
    ])
    expect(wrapper.get('.rest').text()).toContain('4º Eva')
    expect(wrapper.get('.rest').text()).toContain('10 pts')
  })

  it('omits the rest list when every player is on the podium', () => {
    const { wrapper } = mountPodium({ withRest: false })

    expect(wrapper.find('.rest').exists()).toBe(false)
  })

  it('starts a new game with the same configuration', async () => {
    const { store, wrapper } = mountPodium()

    await wrapper.get('button.action-quiet').trigger('click')

    expect(store.phase).toBe('playing')
    expect(store.currentRoundIndex).toBe(0)
    expect(store.scores).toEqual({})
    expect(store.players.map((player) => player.name)).toEqual(['Ana', 'Luis', 'Carmen', 'Eva'])
  })

  it('returns to player configuration from the second end-game action', async () => {
    const { store, wrapper } = mountPodium()

    await wrapper.findAll('button.action-quiet')[1].trigger('click')

    expect(store.phase).toBe('setup-players')
    expect(store.currentRoundIndex).toBe(0)
    expect(store.scores).toEqual({})
  })
})
