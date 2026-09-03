import { createId } from './id'

export function defaultRounds() {
  return [
    { id: createId(), name: '2 tríos', cards: 7 },
    { id: createId(), name: 'Trío + escalera', cards: 8 },
    { id: createId(), name: '2 escaleras', cards: 9 },
    { id: createId(), name: '3 tríos', cards: 10 },
    { id: createId(), name: '2 tríos + escalera', cards: 11 },
    { id: createId(), name: 'Trío + 2 escaleras', cards: 12 },
    { id: createId(), name: '3 escaleras', cards: 13 },
  ]
}
