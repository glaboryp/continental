import { describe, expect, it } from 'vitest'
import { isValidGameState } from './gameState'

function validState(overrides = {}) {
  return {
    phase: 'playing',
    players: [{ id: 'p1', name: 'Ana' }],
    rounds: [{ id: 'r1', name: 'Ronda 1', cards: 7 }],
    scores: { r1: { p1: 4 } },
    currentRoundIndex: 0,
    ...overrides,
  }
}

describe('isValidGameState', () => {
  it.each(['setup-players', 'setup-rounds', 'playing', 'podium'])(
    'accepts a complete %s state',
    (phase) => {
      expect(isValidGameState(validState({ phase }))).toBe(true)
    },
  )

  it('accepts empty setup collections and auxiliary score groups', () => {
    expect(
      isValidGameState(
        validState({
          phase: 'setup-players',
          players: [],
          rounds: [],
          scores: { '__midgame-join__': { removedPlayer: 12 } },
        }),
      ),
    ).toBe(true)
  })

  it.each([
    ['a null state', null],
    ['a primitive state', 'state'],
    ['an array state', []],
    ['an unknown phase', validState({ phase: 'finished' })],
    ['players that are not an array', validState({ players: null })],
    ['a player that is not an object', validState({ players: [null] })],
    ['a player without an id', validState({ players: [{ id: '', name: 'Ana' }] })],
    ['a player without a name', validState({ players: [{ id: 'p1', name: '  ' }] })],
    [
      'duplicate player ids',
      validState({ players: [{ id: 'p1', name: 'Ana' }, { id: 'p1', name: 'Luis' }] }),
    ],
    ['rounds that are not an array', validState({ rounds: null })],
    ['a round that is not an object', validState({ rounds: [null] })],
    ['a round without an id', validState({ rounds: [{ id: '', name: 'Ronda', cards: 7 }] })],
    ['a round without a name', validState({ rounds: [{ id: 'r1', name: '', cards: 7 }] })],
    ['non-integer cards', validState({ rounds: [{ id: 'r1', name: 'Ronda', cards: 7.5 }] })],
    ['non-positive cards', validState({ rounds: [{ id: 'r1', name: 'Ronda', cards: 0 }] })],
    [
      'duplicate round ids',
      validState({
        rounds: [
          { id: 'r1', name: 'Primera', cards: 7 },
          { id: 'r1', name: 'Segunda', cards: 8 },
        ],
      }),
    ],
    ['scores that are not an object', validState({ scores: [] })],
    ['round scores that are not an object', validState({ scores: { r1: null } })],
    ['a score that is not finite', validState({ scores: { r1: { p1: Infinity } } })],
    ['a non-integer round index', validState({ currentRoundIndex: 0.5 })],
    ['a negative round index', validState({ currentRoundIndex: -1 })],
    ['an active game without rounds', validState({ rounds: [] })],
    ['an active game beyond its rounds', validState({ currentRoundIndex: 1 })],
    [
      'setup progress outside the first round',
      validState({ phase: 'setup-rounds', currentRoundIndex: 1 }),
    ],
  ])('rejects %s', (_label, state) => {
    expect(isValidGameState(state)).toBe(false)
  })
})
