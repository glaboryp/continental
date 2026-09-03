import { createId } from './id'

export function defaultRounds() {
  return [
    { id: createId(), name: '2 tríos', cards: 7 },
    { id: createId(), name: 'Trío + escalera', cards: 8 },
    { id: createId(), name: '2 escaleras', cards: 9 },
  ]
}
