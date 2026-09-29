import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RoundSetup from './RoundSetup.vue'
import { useGameStore } from '../stores/game'

function mountRoundSetup() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useGameStore()
  store.goToRoundSetup()
  const wrapper = mount(RoundSetup, {
    global: { plugins: [pinia] },
  })

  return { store, wrapper }
}

describe('RoundSetup', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows empty-round guidance and does not start an empty game', async () => {
    const { store, wrapper } = mountRoundSetup()
    store.rounds = []
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Añade al menos 1 ronda para empezar.')
    expect(wrapper.get('button.action').attributes('disabled')).toBeDefined()

    const startButton = wrapper.get('button.action')
    startButton.element.disabled = false
    await startButton.trigger('click')

    expect(store.phase).toBe('setup-rounds')
    expect(wrapper.find('details.round-tools').exists()).toBe(false)
  })

  it('rejects blank, zero-card, and non-integer rounds before adding a valid round', async () => {
    const { store, wrapper } = mountRoundSetup()
    store.rounds = []
    await wrapper.vm.$nextTick()
    const nameInput = wrapper.get('form input[type="text"]')
    const cardsInput = wrapper.get('form input[type="number"]')

    await wrapper.get('form').trigger('submit')
    expect(store.rounds).toEqual([])

    await nameInput.setValue('Nueva ronda')
    await cardsInput.setValue('0')
    await wrapper.get('form').trigger('submit')
    expect(store.rounds).toEqual([])

    await cardsInput.setValue('2.5')
    await wrapper.get('form').trigger('submit')
    expect(store.rounds).toEqual([])

    await cardsInput.setValue('8')
    await wrapper.get('form').trigger('submit')

    expect(store.rounds).toHaveLength(1)
    expect(store.rounds[0]).toMatchObject({ name: 'Nueva ronda', cards: 8 })
    expect(nameInput.element.value).toBe('')
    expect(cardsInput.element.value).toBe('7')
  })

  it('updates a round name and accepts only positive integer card edits', async () => {
    const { store, wrapper } = mountRoundSetup()
    const firstRound = wrapper.findAll('.round-list li')[0]
    const [nameInput, cardsInput] = firstRound.findAll('input')
    const originalCards = store.rounds[0].cards

    await nameInput.setValue('Nombre actualizado')
    expect(store.rounds[0].name).toBe('Nombre actualizado')

    await cardsInput.setValue('0')
    expect(store.rounds[0].cards).toBe(originalCards)
    await cardsInput.setValue('2.5')
    expect(store.rounds[0].cards).toBe(originalCards)

    await cardsInput.setValue('10')
    expect(store.rounds[0].cards).toBe(10)
  })

  it('reorders and removes rounds using the expanded tools', async () => {
    const { store, wrapper } = mountRoundSetup()
    const tools = wrapper.get('details.round-tools')
    const rows = tools.findAll('li.round-tool')
    const originalOrder = store.rounds.map((round) => round.id)

    expect(rows[0].get('button').attributes('disabled')).toBeDefined()
    expect(rows.at(-1).findAll('button')[1].attributes('disabled')).toBeDefined()

    await rows[1].findAll('button')[0].trigger('click')
    expect(store.rounds.map((round) => round.id)).toEqual([
      originalOrder[1],
      originalOrder[0],
      ...originalOrder.slice(2),
    ])

    await tools.findAll('li.round-tool')[0].findAll('button')[1].trigger('click')
    expect(store.rounds.map((round) => round.id)).toEqual(originalOrder)

    await tools.findAll('li.round-tool')[0].findAll('button')[2].trigger('click')
    expect(store.rounds.map((round) => round.id)).not.toContain(originalOrder[0])
  })

  it('returns to player setup from the change players control', async () => {
    const { store, wrapper } = mountRoundSetup()

    await wrapper.get('button.linkish').trigger('click')

    expect(store.phase).toBe('setup-players')
  })

  it('starts a game once at least one valid round exists', async () => {
    const { store, wrapper } = mountRoundSetup()
    store.rounds = []
    await wrapper.vm.$nextTick()

    await wrapper.get('form input[type="text"]').setValue('Ronda final')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('button.action').attributes('disabled')).toBeUndefined()

    await wrapper.get('button.action').trigger('click')

    expect(store.phase).toBe('playing')
    expect(store.currentRoundIndex).toBe(0)
    expect(store.scores).toEqual({})
  })
})
