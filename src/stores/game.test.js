import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { STORAGE_KEY, useGameStore } from './game'

function setRounds(store) {
  store.rounds = [
    { id: 'r1', name: 'Ronda 1', cards: 7 },
    { id: 'r2', name: 'Ronda 2', cards: 8 },
  ]
}

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

  it('loads a valid persisted game state', async () => {
    const savedState = {
      phase: 'playing',
      players: [{ id: 'p1', name: 'Ana' }],
      rounds: [{ id: 'r1', name: 'Ronda 1', cards: 7 }],
      scores: { r1: { p1: 4 } },
      currentRoundIndex: 0,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState))
    vi.resetModules()
    const { useGameStore: usePersistedGameStore } = await import('./game')
    setActivePinia(createPinia())

    expect(usePersistedGameStore().$state).toMatchObject(savedState)
  })

  it('starts fresh when persisted storage contains malformed JSON', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    vi.resetModules()
    const { useGameStore: useMalformedGameStore } = await import('./game')
    setActivePinia(createPinia())

    const store = useMalformedGameStore()
    expect(store.phase).toBe('setup-players')
    expect(store.players).toEqual([])
  })

  it('returns null current round and handles a missing current round in round order', () => {
    const store = useGameStore()
    store.rounds = []

    expect(store.currentRound).toBeNull()
    expect(store.isLastRound).toBe(false)
    expect(store.roundOrder).toEqual([])
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

  it('rejects blank and case-insensitively duplicate player names', () => {
    const store = useGameStore()
    store.addPlayer('Ana')

    expect(store.hasPlayerName(' ana ')).toBe(true)
    expect(store.hasPlayerName('   ')).toBe(false)
    expect(store.addPlayer('   ')).toBe(false)
    expect(store.addPlayer(' ANA ')).toBe(false)
    expect(store.players).toHaveLength(1)
  })

  it('updates a player only when the name is nonblank and unique', () => {
    const store = useGameStore()
    store.addPlayer('Ana')
    store.addPlayer('Luis')
    const anaId = store.players[0].id

    expect(store.updatePlayer('missing', 'Eva')).toBe(false)
    expect(store.updatePlayer(anaId, '   ')).toBe(false)
    expect(store.updatePlayer(anaId, ' lUiS ')).toBe(false)
    expect(store.updatePlayer(anaId, ' Eva ')).toBe(true)
    expect(store.players[0].name).toBe('Eva')
  })

  it('does not move players beyond list boundaries or when absent', () => {
    const store = useGameStore()
    store.addPlayer('Ana')
    store.addPlayer('Luis')

    store.movePlayer('missing', 1)
    store.movePlayer(store.players[0].id, -1)
    store.movePlayer(store.players[1].id, 1)

    expect(store.players.map((player) => player.name)).toEqual(['Ana', 'Luis'])
  })

  it('returns to player setup only from round setup', () => {
    const store = useGameStore()
    store.backToPlayers()
    expect(store.phase).toBe('setup-players')

    store.goToRoundSetup()
    store.backToPlayers()
    expect(store.phase).toBe('setup-players')
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

  it('calculates totals, standings, and podium results including ties', () => {
    const store = useGameStore()
    setRounds(store)
    store.addPlayer('Ana')
    store.addPlayer('Luis')
    store.addPlayer('Eva')
    store.setScore('r1', store.players[0].id, 5)
    store.setScore('r1', store.players[1].id, 5)
    store.setScore('r1', store.players[2].id, 9)

    expect(store.totals.map(({ name, total }) => ({ name, total }))).toEqual([
      { name: 'Ana', total: 5 },
      { name: 'Luis', total: 5 },
      { name: 'Eva', total: 9 },
    ])
    expect(store.standings.map(({ name, position }) => ({ name, position }))).toEqual([
      { name: 'Ana', position: 1 },
      { name: 'Luis', position: 1 },
      { name: 'Eva', position: 3 },
    ])
    expect(store.podiumResult.podium).toHaveLength(3)
    expect(store.podiumResult.rest).toEqual([])
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

  it('gives a mid-game joiner no handicap when all current totals are zero', () => {
    const store = useGameStore()
    store.addPlayer('Ana')
    store.startGame()
    store.addPlayer('Eva')

    expect(store.totals.find((total) => total.name === 'Eva').total).toBe(0)
    expect(store.scores).toEqual({})
  })

  it('adds the first mid-game player without a handicap', () => {
    const store = useGameStore()
    store.startGame()

    store.addPlayer('Eva')

    expect(store.totals).toEqual([
      { id: store.players[0].id, name: 'Eva', total: 0 },
    ])
    expect(store.scores).toEqual({})
  })

  it('shares one handicap score collection among multiple mid-game joiners', () => {
    const store = useGameStore()
    store.addPlayer('Ana')
    store.startGame()
    store.setScore('r1', store.players[0].id, 10)
    store.addPlayer('Eva')
    store.addPlayer('Luis')

    const handicapScores = Object.entries(store.scores).find(([roundId]) => roundId !== 'r1')[1]
    expect(handicapScores).toMatchObject({
      [store.players[1].id]: 10,
      [store.players[2].id]: 10,
    })
    expect(store.totals.find((total) => total.name === 'Eva').total).toBe(10)
    expect(store.totals.find((total) => total.name === 'Luis').total).toBe(10)
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

  it('accepts numeric strings for valid round cards', () => {
    const store = useGameStore()

    expect(store.addRound(null, 7)).toBe(false)
    expect(store.addRound('Ronda nueva', '7')).toBe(true)
    expect(store.rounds.at(-1)).toMatchObject({ name: 'Ronda nueva', cards: 7 })
  })

  it('updates, removes, and reorders rounds without changing invalid endpoints', () => {
    const store = useGameStore()
    setRounds(store)

    store.updateRound('missing', { name: 'No existe' })
    store.updateRound('r1', { name: 'Actualizada', cards: 10 })
    store.moveRound('missing', 1)
    store.moveRound('r1', -1)
    store.moveRound('r2', 1)
    expect(store.rounds.map((round) => round.name)).toEqual(['Actualizada', 'Ronda 2'])

    store.moveRound('r1', 1)
    expect(store.rounds.map((round) => round.id)).toEqual(['r2', 'r1'])
    store.removeRound('r2')
    expect(store.rounds).toEqual([{ id: 'r1', name: 'Actualizada', cards: 10 }])
  })

  it('creates, overwrites, clears missing, and clears existing scores', () => {
    const store = useGameStore()

    store.clearScore('missing', 'p1')
    store.setScore('r1', 'p1', 4)
    store.setScore('r1', 'p1', 7)
    expect(store.scores).toEqual({ r1: { p1: 7 } })
    store.clearScore('r1', 'p1')
    expect(store.scores).toEqual({ r1: {} })
  })

  it('starts a game and changes players by clearing round progress', () => {
    const store = useGameStore()
    store.addPlayer('Ana')
    store.currentRoundIndex = 1
    store.scores = { r1: { p1: 4 } }

    store.startGame()
    expect(store.phase).toBe('playing')
    expect(store.currentRoundIndex).toBe(0)
    expect(store.scores).toEqual({})

    store.currentRoundIndex = 1
    store.scores = { r1: { p1: 4 } }
    store.changePlayers()
    expect(store.phase).toBe('setup-players')
    expect(store.currentRoundIndex).toBe(0)
    expect(store.scores).toEqual({})
  })
})
