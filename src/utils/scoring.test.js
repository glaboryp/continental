import { describe, it, expect } from 'vitest'
import { calculateTotals, rankPlayers, getPodium } from './scoring'

describe('calculateTotals', () => {
  it('sums each player score across all rounds', () => {
    const players = [
      { id: 'p1', name: 'Ana' },
      { id: 'p2', name: 'Luis' },
    ]
    const scores = {
      r1: { p1: 10, p2: 5 },
      r2: { p1: 3, p2: 8 },
    }
    expect(calculateTotals(players, scores)).toEqual([
      { id: 'p1', name: 'Ana', total: 13 },
      { id: 'p2', name: 'Luis', total: 13 },
    ])
  })

  it('treats missing round scores as 0', () => {
    const players = [{ id: 'p1', name: 'Ana' }]
    const scores = { r1: { p1: 10 }, r2: {} }
    expect(calculateTotals(players, scores)).toEqual([
      { id: 'p1', name: 'Ana', total: 10 },
    ])
  })
})

describe('rankPlayers', () => {
  it('assigns sequential positions when there are no ties', () => {
    const totals = [
      { id: 'p1', name: 'Ana', total: 20 },
      { id: 'p2', name: 'Luis', total: 5 },
      { id: 'p3', name: 'Eva', total: 12 },
    ]
    expect(rankPlayers(totals)).toEqual([
      { id: 'p2', name: 'Luis', total: 5, position: 1 },
      { id: 'p3', name: 'Eva', total: 12, position: 2 },
      { id: 'p1', name: 'Ana', total: 20, position: 3 },
    ])
  })

  it('gives tied totals the same position and skips the next one', () => {
    const totals = [
      { id: 'p1', name: 'Ana', total: 10 },
      { id: 'p2', name: 'Luis', total: 10 },
      { id: 'p3', name: 'Eva', total: 20 },
    ]
    expect(rankPlayers(totals)).toEqual([
      { id: 'p1', name: 'Ana', total: 10, position: 1 },
      { id: 'p2', name: 'Luis', total: 10, position: 1 },
      { id: 'p3', name: 'Eva', total: 20, position: 3 },
    ])
  })
})

describe('getPodium', () => {
  it('splits players with position <= 3 into podium, the rest into rest', () => {
    const ranked = [
      { id: 'p1', name: 'Ana', total: 5, position: 1 },
      { id: 'p2', name: 'Luis', total: 10, position: 2 },
      { id: 'p3', name: 'Eva', total: 15, position: 3 },
      { id: 'p4', name: 'Ibai', total: 20, position: 4 },
    ]
    expect(getPodium(ranked)).toEqual({
      podium: [ranked[0], ranked[1], ranked[2]],
      rest: [ranked[3]],
    })
  })
})
