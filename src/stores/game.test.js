import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from './game'

describe('useGameStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('starts in setup-players phase with the default rounds preloaded', () => {
    const store = useGameStore()
    expect(store.phase).toBe('setup-players')
    expect(store.rounds.length).toBeGreaterThan(0)
    expect(store.players).toEqual([])
  })

  it('adds and removes players', () => {
    const store = useGameStore()
    store.addPlayer('Ana')
    store.addPlayer('Luis')
    expect(store.players.map((p) => p.name)).toEqual(['Ana', 'Luis'])

    const anaId = store.players[0].id
    store.removePlayer(anaId)
    expect(store.players.map((p) => p.name)).toEqual(['Luis'])
  })

  it('moves a player up or down in the list', () => {
    const store = useGameStore()
    store.addPlayer('Ana')
    store.addPlayer('Luis')
    const anaId = store.players[0].id

    store.movePlayer(anaId, 1)
    expect(store.players.map((p) => p.name)).toEqual(['Luis', 'Ana'])

    store.movePlayer(anaId, -1)
    expect(store.players.map((p) => p.name)).toEqual(['Ana', 'Luis'])
  })

  it('advances currentRoundIndex on confirmRound and reaches podium after the last round', () => {
    const store = useGameStore()
    store.rounds = [
      { id: 'r1', name: 'Ronda 1', cards: 7 },
      { id: 'r2', name: 'Ronda 2', cards: 8 },
      { id: 'r3', name: 'Ronda 3', cards: 9 },
    ]
    store.addPlayer('Ana')
    store.addPlayer('Luis')
    store.startGame()

    expect(store.currentRoundIndex).toBe(0)
    store.confirmRound()
    expect(store.currentRoundIndex).toBe(1)
    store.confirmRound()
    expect(store.currentRoundIndex).toBe(2)
    expect(store.phase).toBe('playing')

    store.confirmRound()
    expect(store.phase).toBe('podium')
  })

  it('keeps the current hand out of the displayed round order totals', () => {
    const store = useGameStore()
    store.rounds = [
      { id: 'r1', name: 'Ronda 1', cards: 7 },
      { id: 'r2', name: 'Ronda 2', cards: 8 },
    ]
    store.addPlayer('Ana')
    store.addPlayer('Luis')
    store.startGame()
    store.setScore('r1', store.players[0].id, 15)

    expect(store.roundOrder.map(({ name, total }) => ({ name, total }))).toEqual([
      { name: 'Ana', total: 0 },
      { name: 'Luis', total: 0 },
    ])

    store.confirmRound()
    store.setScore('r2', store.players[1].id, 4)

    expect(store.roundOrder.map(({ name, total }) => ({ name, total }))).toEqual([
      { name: 'Luis', total: 0 },
      { name: 'Ana', total: 15 },
    ])
  })

  it('newGame resets scores and phase but keeps players and rounds', () => {
    const store = useGameStore()
    store.rounds = [
      { id: 'r1', name: 'Ronda 1', cards: 7 },
      { id: 'r2', name: 'Ronda 2', cards: 8 },
      { id: 'r3', name: 'Ronda 3', cards: 9 },
    ]
    store.addPlayer('Ana')
    store.startGame()
    store.setScore(store.rounds[0].id, store.players[0].id, 15)
    store.confirmRound()
    store.confirmRound()
    store.confirmRound()
    expect(store.phase).toBe('podium')

    const playersBefore = store.players
    const roundsBefore = store.rounds
    store.newGame()

    expect(store.phase).toBe('playing')
    expect(store.currentRoundIndex).toBe(0)
    expect(store.scores).toEqual({})
    expect(store.players).toEqual(playersBefore)
    expect(store.rounds).toEqual(roundsBefore)
  })

  it('a player added mid-game starts with the same total as the current highest scorer', () => {
    const store = useGameStore()
    store.rounds = [
      { id: 'r1', name: 'Ronda 1', cards: 7 },
      { id: 'r2', name: 'Ronda 2', cards: 8 },
    ]
    store.addPlayer('Ana')
    store.addPlayer('Luis')
    store.startGame()
    store.setScore(store.rounds[0].id, store.players[0].id, 10)
    store.setScore(store.rounds[0].id, store.players[1].id, 25)

    store.addPlayer('Eva')

    const eva = store.totals.find((t) => t.name === 'Eva')
    expect(eva.total).toBe(25)
    // Doesn't affect the existing players' own totals.
    expect(store.totals.find((t) => t.name === 'Luis').total).toBe(25)
    expect(store.totals.find((t) => t.name === 'Ana').total).toBe(10)
  })

  it('adding a player before the game starts gives no handicap', () => {
    const store = useGameStore()
    store.addPlayer('Ana')
    const ana = store.totals.find((t) => t.name === 'Ana')
    expect(ana.total).toBe(0)
  })

  it('resetGame clears players and restores default rounds', () => {
    const store = useGameStore()
    store.addPlayer('Ana')
    store.addPlayer('Luis')
    store.addRound('Ronda extra', 14)
    store.startGame()
    store.setScore(store.rounds[0].id, store.players[0].id, 15)

    store.resetGame()

    expect(store.phase).toBe('setup-players')
    expect(store.players).toEqual([])
    expect(store.rounds.length).toBeGreaterThan(0)
    expect(store.rounds.some((r) => r.name === 'Ronda extra')).toBe(false)
    expect(store.scores).toEqual({})
    expect(store.currentRoundIndex).toBe(0)
  })

  it('rejects invalid rounds instead of storing unusable setup data', () => {
    const store = useGameStore()
    const initialCount = store.rounds.length

    expect(store.addRound('   ', 7)).toBe(false)
    expect(store.addRound('Ronda inválida', 0)).toBe(false)
    expect(store.addRound('Ronda inválida', 7.5)).toBe(false)
    expect(store.rounds).toHaveLength(initialCount)
  })
})
