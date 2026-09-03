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
})
