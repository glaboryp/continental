import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PlayerSetup from './PlayerSetup.vue'
import { useGameStore } from '../stores/game'

function mountPlayerSetup() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useGameStore()
  const wrapper = mount(PlayerSetup, {
    global: { plugins: [pinia] },
  })

  return { store, wrapper }
}

describe('PlayerSetup', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('keeps the user in player setup until at least two players exist', async () => {
    const { store, wrapper } = mountPlayerSetup()

    expect(wrapper.text()).toContain('Añade al menos 2 jugadores para empezar.')
    expect(wrapper.get('button.action').attributes('disabled')).toBeDefined()

    const continueButton = wrapper.get('button.action')
    continueButton.element.disabled = false
    await continueButton.trigger('click')

    expect(store.phase).toBe('setup-players')
  })

  it('ignores blank names and adds a valid player through the form', async () => {
    const { store, wrapper } = mountPlayerSetup()
    const nameInput = wrapper.get('input[autocomplete="name"]')

    await wrapper.get('form').trigger('submit')
    expect(store.players).toEqual([])

    await nameInput.setValue(' Ana ')
    await wrapper.get('form').trigger('submit')

    expect(store.players.map((player) => player.name)).toEqual(['Ana'])
    expect(nameInput.element.value).toBe('')
  })

  it('shows a duplicate error and clears it after a successful addition', async () => {
    const { store, wrapper } = mountPlayerSetup()
    const nameInput = wrapper.get('input[autocomplete="name"]')

    await nameInput.setValue('Ana')
    await wrapper.get('form').trigger('submit')
    await nameInput.setValue(' ana ')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('[aria-live="polite"]').text()).toBe('Ya hay un jugador con ese nombre.')
    expect(store.players).toHaveLength(1)

    await nameInput.setValue('Luis')
    await wrapper.get('form').trigger('submit')

    expect(store.players.map((player) => player.name)).toEqual(['Ana', 'Luis'])
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(false)
  })

  it('rejects a duplicate rename by restoring the displayed name', async () => {
    const { wrapper } = mountPlayerSetup()
    const nameInput = wrapper.get('input[autocomplete="name"]')

    await nameInput.setValue('Ana')
    await wrapper.get('form').trigger('submit')
    await nameInput.setValue('Luis')
    await wrapper.get('form').trigger('submit')

    const playerInputs = wrapper.findAll('li.line > input')
    playerInputs[1].element.value = ' ANA '
    await playerInputs[1].trigger('change')

    expect(playerInputs[1].element.value).toBe('Luis')
    expect(wrapper.get('[aria-live="polite"]').text()).toBe('Ya hay un jugador con ese nombre.')
  })

  it('renames, reorders, and removes players using visible controls', async () => {
    const { store, wrapper } = mountPlayerSetup()
    const nameInput = wrapper.get('input[autocomplete="name"]')

    for (const name of ['Ana', 'Luis', 'Eva']) {
      await nameInput.setValue(name)
      await wrapper.get('form').trigger('submit')
    }

    let rows = wrapper.findAll('li.line')
    expect(rows[0].get('button').attributes('disabled')).toBeDefined()
    expect(rows[2].findAll('button')[1].attributes('disabled')).toBeDefined()

    const renamedInput = rows[0].get('input')
    await renamedInput.setValue('Anita')
    await renamedInput.trigger('change')
    expect(store.players[0].name).toBe('Anita')

    await rows[1].findAll('button')[0].trigger('click')
    expect(store.players.map((player) => player.name)).toEqual(['Luis', 'Anita', 'Eva'])

    rows = wrapper.findAll('li.line')
    await rows[0].findAll('button')[1].trigger('click')
    expect(store.players.map((player) => player.name)).toEqual(['Anita', 'Luis', 'Eva'])

    rows = wrapper.findAll('li.line')
    await rows[1].findAll('button')[2].trigger('click')
    expect(store.players.map((player) => player.name)).toEqual(['Anita', 'Eva'])
  })

  it('continues to round setup after two players are configured', async () => {
    const { store, wrapper } = mountPlayerSetup()
    const nameInput = wrapper.get('input[autocomplete="name"]')

    for (const name of ['Ana', 'Luis']) {
      await nameInput.setValue(name)
      await wrapper.get('form').trigger('submit')
    }

    expect(wrapper.get('button.action').attributes('disabled')).toBeUndefined()
    await wrapper.get('button.action').trigger('click')

    expect(store.phase).toBe('setup-rounds')
  })
})
