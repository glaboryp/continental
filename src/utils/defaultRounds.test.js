import { describe, it, expect } from 'vitest'
import { defaultRounds } from './defaultRounds'

describe('defaultRounds', () => {
  it('returns the standard 3-round sequence with increasing card counts', () => {
    const rounds = defaultRounds()
    expect(rounds.map((r) => r.name)).toEqual([
      '2 tríos',
      'Trío + escalera',
      '2 escaleras',
    ])
    expect(rounds.map((r) => r.cards)).toEqual([7, 8, 9])
  })

  it('assigns a unique id to each round', () => {
    const rounds = defaultRounds()
    const ids = new Set(rounds.map((r) => r.id))
    expect(ids.size).toBe(3)
  })
})
