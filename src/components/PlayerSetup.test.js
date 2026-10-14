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

  it('renames and removes players using the inline trash control', async () => {
    const { store, wrapper } = mountPlayerSetup()
    const nameInput = wrapper.get('input[autocomplete="name"]')

    for (const name of ['Ana', 'Luis']) {
      await nameInput.setValue(name)
      await wrapper.get('form').trigger('submit')
    }

    let rows = wrapper.findAll('li.line')
    expect(wrapper.text()).not.toContain('Subir')
    expect(wrapper.text()).not.toContain('Bajar')
    expect(wrapper.text()).not.toContain('Quitar')
    expect(rows).toHaveLength(2)
    expect(rows.every((row) => row.find('button.remove-player svg').exists())).toBe(true)
    expect(rows[0].get('button.remove-player').attributes('aria-label')).toBe('Quitar a Ana')
    expect(rows[0].get('button.remove-player').attributes('title')).toBe('Quitar a Ana')

    const renamedInput = rows[0].get('input')
    await renamedInput.setValue('Anita')
    await renamedInput.trigger('change')
    expect(store.players[0].name).toBe('Anita')

    await rows[1].get('button.remove-player').trigger('click')
    expect(store.players.map((player) => player.name)).toEqual(['Anita'])
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
