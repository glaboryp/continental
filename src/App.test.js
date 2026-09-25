import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'
import { useGameStore } from './stores/game'

function mountApp() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useGameStore()
  const wrapper = mount(App, { global: { plugins: [pinia] } })

  return { store, wrapper }
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it.each([
    ['setup-players', 'Jugadores'],
    ['setup-rounds', 'Rondas'],
    ['playing', 'Puntuación'],
    ['podium', 'Resultado'],
  ])('renders the %s phase', async (phase, heading) => {
    const { store, wrapper } = mountApp()

    if (phase === 'playing') {
      store.rounds = [{ id: 'score', name: heading, cards: 7 }]
    }
    store.phase = phase
    await wrapper.vm.$nextTick()

    expect(wrapper.get('.page-title').text()).toBe(heading)
  })

  it('opens and cancels the reset confirmation dialog', async () => {
    const { wrapper } = mountApp()

    await wrapper.get('.linkish').trigger('click')
    expect(wrapper.get('[role="alertdialog"]').text()).toContain('Se borrarán la partida')

    await wrapper.get('[role="alertdialog"] button:last-child').trigger('click')
    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
    expect(wrapper.get('.linkish').text()).toBe('Borrar partida')
  })

  it('resets game state after confirming the destructive action', async () => {
    const { store, wrapper } = mountApp()
    store.players = [{ id: 'ana', name: 'Ana' }]
    store.rounds = [{ id: 'final', name: 'Final', cards: 7 }]
    store.scores = { final: { ana: 5 } }
    store.currentRoundIndex = 1
    store.phase = 'podium'

    await wrapper.get('.linkish').trigger('click')
    await wrapper.get('[role="alertdialog"] button').trigger('click')

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
    expect(store.phase).toBe('setup-players')
    expect(store.players).toEqual([])
    expect(store.scores).toEqual({})
    expect(store.currentRoundIndex).toBe(0)
  })
})
