import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ScoreBoard from './ScoreBoard.vue'
import { useGameStore } from '../stores/game'

function mountScoreBoard({ attachTo, lastRound = false } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useGameStore()
  store.players = [
    { id: 'ana', name: 'Ana' },
    { id: 'luis', name: 'Luis' },
  ]
  store.rounds = lastRound
    ? [{ id: 'final', name: 'Final', cards: 7 }]
    : [
        { id: 'first', name: 'Primera', cards: 3 },
        { id: 'second', name: 'Segunda', cards: 5 },
      ]
  store.phase = 'playing'
  store.currentRoundIndex = 0
  store.scores = {}

  const wrapper = mount(ScoreBoard, {
    attachTo,
    global: { plugins: [pinia] },
  })

  return { store, wrapper }
}

describe('ScoreBoard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows missing-score copy, prevents confirmation, and clears an entered score', async () => {
    const { store, wrapper } = mountScoreBoard()
    const confirm = wrapper.get('button.action')

    expect(wrapper.text()).toContain('Faltan los puntos de Ana, Luis.')
    expect(confirm.attributes('disabled')).toBeDefined()

    await wrapper.findAll('.score-input')[0].setValue('4')
    expect(store.scores.first.ana).toBe(4)

    await wrapper.findAll('.score-input')[0].setValue('')
    expect(store.scores.first.ana).toBeUndefined()
    expect(confirm.attributes('disabled')).toBeDefined()

    confirm.element.disabled = false
    await confirm.trigger('click')
    expect(store.currentRoundIndex).toBe(0)
    expect(store.phase).toBe('playing')
  })

  it('confirms complete scores by advancing to the next round', async () => {
    const { store, wrapper } = mountScoreBoard()
    const inputs = wrapper.findAll('.score-input')

    await inputs[0].setValue('4')
    await inputs[1].setValue('7')

    expect(wrapper.text()).toContain(
      'Al pasar a la siguiente ronda, esta puntuación ya no se puede cambiar.',
    )
    expect(wrapper.get('button.action').attributes('disabled')).toBeUndefined()

    await wrapper.get('button.action').trigger('click')

    expect(store.currentRoundIndex).toBe(1)
    expect(store.phase).toBe('playing')
  })

  it('confirms a complete final round by showing the podium', async () => {
    const { store, wrapper } = mountScoreBoard({ lastRound: true })
    const inputs = wrapper.findAll('.score-input')

    await inputs[0].setValue('4')
    await inputs[1].setValue('7')

    expect(wrapper.text()).toContain(
      'Al ver el podio, esta puntuación ya no se puede cambiar.',
    )
    expect(wrapper.get('button.action').text()).toBe('Ver podio')

    await wrapper.get('button.action').trigger('click')

    expect(store.phase).toBe('podium')
  })

  it('moves focus to the next score input after a row advances', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    const { wrapper } = mountScoreBoard({ attachTo: document.body })
    const inputs = wrapper.findAll('.score-input')

    await inputs[0].trigger('keydown.enter')

    expect(focus).toHaveBeenCalledTimes(1)
    expect(focus.mock.instances).toEqual([inputs[1].element])
    expect(document.activeElement).toBe(inputs[1].element)
    focus.mockRestore()
    wrapper.unmount()
  })

  it('rejects blank and duplicate players, then adds a unique player during play', async () => {
    const { store, wrapper } = mountScoreBoard()
    const nameInput = wrapper.get('.add-line input')

    await wrapper.get('.add-line').trigger('submit')
    expect(store.players.map((player) => player.name)).toEqual(['Ana', 'Luis'])

    await nameInput.setValue(' ana ')
    await wrapper.get('.add-line').trigger('submit')
    expect(wrapper.get('[aria-live="polite"]').text()).toBe('Ya hay un jugador con ese nombre.')

    await nameInput.setValue('Eva')
    await wrapper.get('.add-line').trigger('submit')

    expect(store.players.map((player) => player.name)).toEqual(['Ana', 'Luis', 'Eva'])
    expect(nameInput.element.value).toBe('')
    expect(wrapper.find('details [aria-live="polite"]').exists()).toBe(false)
  })
})
