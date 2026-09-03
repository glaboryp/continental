# Continental Scoreboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Vue app to keep score for a Continental card game on a shared tablet/phone: set up players and rounds, enter scores round by round, and land on a podium screen at the end.

**Architecture:** Vue 3 SPA with a single Pinia store (`useGameStore`) holding the whole game state (players, rounds, scores, current phase). Components read/write only through the store. All scoring math (totals, ranking, podium split) lives in pure, independently-tested functions in `src/utils/scoring.js`. The store persists its full state to `localStorage` on every change and rehydrates from it on load — no backend.

**Tech Stack:** Vue 3, Vite 5, Pinia 2, Tailwind CSS 4 (`@tailwindcss/vite`), Vitest 2.

**Spec:** `docs/superpowers/specs/2026-09-03-continental-scoreboard-design.md`

## Global Constraints

- No backend, no accounts: all state lives client-side in `localStorage`.
- Only the active game is persisted — no history of past games.
- Minimum 2 players required to leave player setup.
- Winner = player with the **lowest** total score.
- UI copy is in Spanish (the app is for the user's own game group).
- Default round sequence on first load: "2 tríos" (7 cartas), "Trío + escalera" (8 cartas), "2 escaleras" (9 cartas) — editable before starting.
- "Nueva partida" from the podium keeps the same players and rounds, resets only scores.
- Automated tests cover only the pure scoring/store logic (per spec); component behavior is verified manually in the browser.
- Branch: create `mvp-scoreboard` from `master` before starting (personal project, no ticket system — short kebab-case branch name).
- Commits: Conventional Commits, English, imperative mood, no `Co-authored-by` trailer, no references to "Task N" or the plan/spec.

---

### Task 1: Project scaffolding — Vite + Vue 3 + Tailwind + Vitest

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/App.vue`
- Create: `src/style.css`
- Create: `.gitignore`

**Interfaces:**
- Produces: a working Vite dev/build toolchain, Tailwind utility classes available in any `.vue` file, and Vitest configured with `environment: 'jsdom'` for later tasks.

- [ ] **Step 1: Create the feature branch**

Run:
```bash
git checkout -b mvp-scoreboard
```
Expected: `Switched to a new branch 'mvp-scoreboard'`

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "continental",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "pinia": "^2.2.6",
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@vitejs/plugin-vue": "^5.2.1",
    "jsdom": "^25.0.1",
    "tailwindcss": "^4.0.0",
    "vite": "^5.4.11",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 3: Write `vite.config.js`**

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  test: {
    environment: 'jsdom',
  },
})
```

- [ ] **Step 4: Write `index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Continental</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 5: Write `src/style.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 6: Write `src/App.vue` (placeholder)**

```vue
<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center">
    <h1 class="text-2xl font-bold text-slate-800">Continental</h1>
  </div>
</template>
```

- [ ] **Step 7: Write `src/main.js`**

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

- [ ] **Step 8: Write `.gitignore`**

```
node_modules
dist
```

- [ ] **Step 9: Install dependencies**

Run: `npm install`
Expected: installs with no errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 10: Verify the build works**

Run: `npm run build`
Expected: `✓ built in ...` with no errors, creates `dist/`.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html src .gitignore
git commit -m "chore: scaffold Vite + Vue 3 + Tailwind + Vitest project"
```

---

### Task 2: Pure scoring utilities

**Files:**
- Create: `src/utils/scoring.js`
- Test: `src/utils/scoring.test.js`

**Interfaces:**
- Consumes: nothing (pure functions, no dependencies on other app code).
- Produces:
  - `calculateTotals(players, scores)` → `Array<{ id: string, name: string, total: number }>`
    - `players: Array<{ id: string, name: string }>`
    - `scores: Record<roundId: string, Record<playerId: string, number>>`
  - `rankPlayers(totals)` → `Array<{ id, name, total, position: number }>`, sorted ascending by `total`, ties share the same `position` (standard competition ranking: 1, 2, 2, 4).
  - `getPodium(rankedPlayers)` → `{ podium: Array<...>, rest: Array<...> }`, `podium` = entries with `position <= 3`.

- [ ] **Step 1: Write the failing tests**

```js
// src/utils/scoring.test.js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/utils/scoring.test.js`
Expected: FAIL — `Failed to resolve import "./scoring"` (the file doesn't exist yet).

- [ ] **Step 3: Implement `src/utils/scoring.js`**

```js
export function calculateTotals(players, scores) {
  return players.map((player) => {
    const total = Object.values(scores).reduce((sum, roundScores) => {
      return sum + (roundScores[player.id] ?? 0)
    }, 0)
    return { id: player.id, name: player.name, total }
  })
}

export function rankPlayers(totals) {
  const sorted = [...totals].sort((a, b) => a.total - b.total)
  let lastTotal = null
  let lastPosition = 0
  return sorted.map((entry, index) => {
    const position = entry.total === lastTotal ? lastPosition : index + 1
    lastTotal = entry.total
    lastPosition = position
    return { ...entry, position }
  })
}

export function getPodium(rankedPlayers) {
  return {
    podium: rankedPlayers.filter((entry) => entry.position <= 3),
    rest: rankedPlayers.filter((entry) => entry.position > 3),
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/utils/scoring.test.js`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/scoring.js src/utils/scoring.test.js
git commit -m "feat: add pure scoring, ranking and podium utilities"
```

---

### Task 3: Default rounds and id helper

**Files:**
- Create: `src/utils/id.js`
- Create: `src/utils/defaultRounds.js`
- Test: `src/utils/defaultRounds.test.js`

**Interfaces:**
- Produces:
  - `createId()` → `string` (unique id, via `crypto.randomUUID()`).
  - `defaultRounds()` → `Array<{ id: string, name: string, cards: number }>`, the 3-round default sequence.

- [ ] **Step 1: Write the failing test**

```js
// src/utils/defaultRounds.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/defaultRounds.test.js`
Expected: FAIL — `Failed to resolve import "./defaultRounds"`.

- [ ] **Step 3: Implement `src/utils/id.js`**

```js
export function createId() {
  return crypto.randomUUID()
}
```

- [ ] **Step 4: Implement `src/utils/defaultRounds.js`**

```js
import { createId } from './id'

export function defaultRounds() {
  return [
    { id: createId(), name: '2 tríos', cards: 7 },
    { id: createId(), name: 'Trío + escalera', cards: 8 },
    { id: createId(), name: '2 escaleras', cards: 9 },
  ]
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/utils/defaultRounds.test.js`
Expected: PASS — both tests green.

- [ ] **Step 6: Commit**

```bash
git add src/utils/id.js src/utils/defaultRounds.js src/utils/defaultRounds.test.js
git commit -m "feat: add id helper and default round sequence"
```

---

### Task 4: Pinia game store with localStorage persistence

**Files:**
- Create: `src/stores/game.js`
- Test: `src/stores/game.test.js`
- Modify: `src/main.js` (wire up persistence subscription)

**Interfaces:**
- Consumes: `defaultRounds()`, `createId()` from Task 3; `calculateTotals`, `rankPlayers`, `getPodium` from Task 2.
- Produces (used by every component task from here on):
  - `useGameStore()` — Pinia store `'game'`.
  - State: `phase: 'setup-players' | 'setup-rounds' | 'playing' | 'podium'`, `players: Array<{id, name}>`, `rounds: Array<{id, name, cards}>`, `scores: Record<roundId, Record<playerId, number>>`, `currentRoundIndex: number`.
  - Getters: `currentRound`, `isLastRound`, `totals`, `standings`, `podiumResult: { podium, rest }`.
  - Actions: `addPlayer(name)`, `removePlayer(id)`, `movePlayer(id, direction: -1 | 1)`, `goToRoundSetup()`, `addRound(name, cards)`, `removeRound(id)`, `updateRound(id, changes)`, `moveRound(id, direction: -1 | 1)`, `startGame()`, `setScore(roundId, playerId, value)`, `confirmRound()`, `newGame()`.
  - `STORAGE_KEY: string` (named export, reused by `main.js`).

- [ ] **Step 1: Write the failing tests**

```js
// src/stores/game.test.js
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
    expect(store.rounds).toHaveLength(3)
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/stores/game.test.js`
Expected: FAIL — `Failed to resolve import "./game"`.

- [ ] **Step 3: Implement `src/stores/game.js`**

```js
import { defineStore } from 'pinia'
import { defaultRounds } from '../utils/defaultRounds'
import { createId } from '../utils/id'
import { calculateTotals, rankPlayers, getPodium } from '../utils/scoring'

export const STORAGE_KEY = 'continental-game-state'

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useGameStore = defineStore('game', {
  state: () => {
    return (
      loadInitialState() ?? {
        phase: 'setup-players',
        players: [],
        rounds: defaultRounds(),
        scores: {},
        currentRoundIndex: 0,
      }
    )
  },
  getters: {
    currentRound(state) {
      return state.rounds[state.currentRoundIndex] ?? null
    },
    isLastRound(state) {
      return state.currentRoundIndex === state.rounds.length - 1
    },
    totals(state) {
      return calculateTotals(state.players, state.scores)
    },
    standings(state) {
      return rankPlayers(calculateTotals(state.players, state.scores))
    },
    podiumResult(state) {
      return getPodium(rankPlayers(calculateTotals(state.players, state.scores)))
    },
  },
  actions: {
    addPlayer(name) {
      this.players.push({ id: createId(), name })
    },
    removePlayer(id) {
      this.players = this.players.filter((p) => p.id !== id)
    },
    movePlayer(id, direction) {
      const index = this.players.findIndex((p) => p.id === id)
      const target = index + direction
      if (index === -1 || target < 0 || target >= this.players.length) return
      const players = [...this.players]
      ;[players[index], players[target]] = [players[target], players[index]]
      this.players = players
    },
    goToRoundSetup() {
      this.phase = 'setup-rounds'
    },
    addRound(name, cards) {
      this.rounds.push({ id: createId(), name, cards })
    },
    removeRound(id) {
      this.rounds = this.rounds.filter((r) => r.id !== id)
    },
    updateRound(id, changes) {
      const round = this.rounds.find((r) => r.id === id)
      if (round) Object.assign(round, changes)
    },
    moveRound(id, direction) {
      const index = this.rounds.findIndex((r) => r.id === id)
      const target = index + direction
      if (index === -1 || target < 0 || target >= this.rounds.length) return
      const rounds = [...this.rounds]
      ;[rounds[index], rounds[target]] = [rounds[target], rounds[index]]
      this.rounds = rounds
    },
    startGame() {
      this.phase = 'playing'
      this.currentRoundIndex = 0
      this.scores = {}
    },
    setScore(roundId, playerId, value) {
      if (!this.scores[roundId]) this.scores[roundId] = {}
      this.scores[roundId][playerId] = value
    },
    confirmRound() {
      if (this.isLastRound) {
        this.phase = 'podium'
      } else {
        this.currentRoundIndex += 1
      }
    },
    newGame() {
      this.phase = 'playing'
      this.currentRoundIndex = 0
      this.scores = {}
    },
  },
})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/stores/game.test.js`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Wire up localStorage persistence in `src/main.js`**

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useGameStore, STORAGE_KEY } from './stores/game'
import './style.css'

const app = createApp(App)
app.use(createPinia())

const gameStore = useGameStore()
gameStore.$subscribe((_mutation, state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}, { detached: true })

app.mount('#app')
```

- [ ] **Step 6: Verify the app still builds**

Run: `npm run build`
Expected: `✓ built in ...` with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/stores/game.js src/stores/game.test.js src/main.js
git commit -m "feat: add game store with localStorage persistence"
```

---

### Task 5: App phase router + player setup screen

**Files:**
- Modify: `src/App.vue`
- Create: `src/components/PlayerSetup.vue`

**Interfaces:**
- Consumes: `useGameStore()` from Task 4 (`phase`, `players`, `addPlayer`, `removePlayer`, `movePlayer`, `goToRoundSetup`).
- Produces: `App.vue` renders one of `PlayerSetup` / `RoundSetup` / `ScoreBoard` / `PodiumView` based on `store.phase` (the latter three are stubbed as empty placeholder components in this task and implemented in Tasks 6-8).

- [ ] **Step 1: Create placeholder stubs so `App.vue` can import all four screens**

`src/components/RoundSetup.vue`:
```vue
<template>
  <div class="p-6">Rondas (pendiente)</div>
</template>
```

`src/components/ScoreBoard.vue`:
```vue
<template>
  <div class="p-6">Tablero (pendiente)</div>
</template>
```

`src/components/PodiumView.vue`:
```vue
<template>
  <div class="p-6">Podio (pendiente)</div>
</template>
```

- [ ] **Step 2: Implement `src/components/PlayerSetup.vue`**

```vue
<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()
const newName = ref('')

function addPlayer() {
  const name = newName.value.trim()
  if (!name) return
  store.addPlayer(name)
  newName.value = ''
}

function continueToRounds() {
  if (store.players.length < 2) return
  store.goToRoundSetup()
}
</script>

<template>
  <div class="mx-auto max-w-md space-y-4 p-6">
    <h1 class="text-2xl font-bold text-slate-800">Jugadores</h1>

    <form class="flex gap-2" @submit.prevent="addPlayer">
      <input
        v-model="newName"
        type="text"
        placeholder="Nombre del jugador"
        class="flex-1 rounded-lg border border-slate-300 px-3 py-2"
      />
      <button type="submit" class="rounded-lg bg-slate-800 px-4 py-2 text-white">
        Añadir
      </button>
    </form>

    <ul class="space-y-2">
      <li
        v-for="(player, index) in store.players"
        :key="player.id"
        class="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm"
      >
        <span>{{ player.name }}</span>
        <div class="flex gap-1">
          <button
            type="button"
            :disabled="index === 0"
            class="px-2 disabled:opacity-30"
            @click="store.movePlayer(player.id, -1)"
          >
            ↑
          </button>
          <button
            type="button"
            :disabled="index === store.players.length - 1"
            class="px-2 disabled:opacity-30"
            @click="store.movePlayer(player.id, 1)"
          >
            ↓
          </button>
          <button
            type="button"
            class="px-2 text-red-600"
            @click="store.removePlayer(player.id)"
          >
            ✕
          </button>
        </div>
      </li>
    </ul>

    <p v-if="store.players.length < 2" class="text-sm text-slate-500">
      Añade al menos 2 jugadores para continuar.
    </p>

    <button
      type="button"
      :disabled="store.players.length < 2"
      class="w-full rounded-lg bg-emerald-600 px-4 py-3 text-white disabled:opacity-30"
      @click="continueToRounds"
    >
      Continuar
    </button>
  </div>
</template>
```

- [ ] **Step 3: Implement `src/App.vue` as the phase router**

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useGameStore } from './stores/game'
import PlayerSetup from './components/PlayerSetup.vue'
import RoundSetup from './components/RoundSetup.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import PodiumView from './components/PodiumView.vue'

const store = useGameStore()
const { phase } = storeToRefs(store)
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <PlayerSetup v-if="phase === 'setup-players'" />
    <RoundSetup v-else-if="phase === 'setup-rounds'" />
    <ScoreBoard v-else-if="phase === 'playing'" />
    <PodiumView v-else-if="phase === 'podium'" />
  </div>
</template>
```

- [ ] **Step 4: Manually verify in the browser**

Run: `npm run dev`, open the printed local URL.
Expected: the "Jugadores" screen loads, you can add at least 2 players, reorder them with ↑/↓, remove one with ✕, and "Continuar" is disabled until there are 2+ players. Clicking it shows the "Rondas (pendiente)" placeholder.

- [ ] **Step 5: Commit**

```bash
git add src/App.vue src/components/PlayerSetup.vue src/components/RoundSetup.vue src/components/ScoreBoard.vue src/components/PodiumView.vue
git commit -m "feat: add phase router and player setup screen"
```

---

### Task 6: Round setup screen

**Files:**
- Modify: `src/components/RoundSetup.vue`

**Interfaces:**
- Consumes: `useGameStore()` (`rounds`, `addRound`, `removeRound`, `updateRound`, `moveRound`, `startGame`).

- [ ] **Step 1: Implement `src/components/RoundSetup.vue`**

```vue
<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()
const newName = ref('')
const newCards = ref(7)

function addRound() {
  const name = newName.value.trim()
  if (!name || !newCards.value) return
  store.addRound(name, Number(newCards.value))
  newName.value = ''
  newCards.value = 7
}

function startGame() {
  if (store.rounds.length === 0) return
  store.startGame()
}
</script>

<template>
  <div class="mx-auto max-w-md space-y-4 p-6">
    <h1 class="text-2xl font-bold text-slate-800">Rondas</h1>

    <ul class="space-y-2">
      <li
        v-for="(round, index) in store.rounds"
        :key="round.id"
        class="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm"
      >
        <input
          :value="round.name"
          type="text"
          class="flex-1 rounded border border-slate-300 px-2 py-1"
          @input="store.updateRound(round.id, { name: $event.target.value })"
        />
        <input
          :value="round.cards"
          type="number"
          min="1"
          class="w-16 rounded border border-slate-300 px-2 py-1"
          @input="store.updateRound(round.id, { cards: Number($event.target.value) })"
        />
        <div class="flex gap-1">
          <button
            type="button"
            :disabled="index === 0"
            class="px-2 disabled:opacity-30"
            @click="store.moveRound(round.id, -1)"
          >
            ↑
          </button>
          <button
            type="button"
            :disabled="index === store.rounds.length - 1"
            class="px-2 disabled:opacity-30"
            @click="store.moveRound(round.id, 1)"
          >
            ↓
          </button>
          <button
            type="button"
            class="px-2 text-red-600"
            @click="store.removeRound(round.id)"
          >
            ✕
          </button>
        </div>
      </li>
    </ul>

    <form class="flex gap-2" @submit.prevent="addRound">
      <input
        v-model="newName"
        type="text"
        placeholder="Nombre de la ronda"
        class="flex-1 rounded-lg border border-slate-300 px-3 py-2"
      />
      <input
        v-model="newCards"
        type="number"
        min="1"
        class="w-20 rounded-lg border border-slate-300 px-3 py-2"
      />
      <button type="submit" class="rounded-lg bg-slate-800 px-4 py-2 text-white">
        Añadir
      </button>
    </form>

    <p v-if="store.rounds.length === 0" class="text-sm text-slate-500">
      Añade al menos 1 ronda para empezar.
    </p>

    <button
      type="button"
      :disabled="store.rounds.length === 0"
      class="w-full rounded-lg bg-emerald-600 px-4 py-3 text-white disabled:opacity-30"
      @click="startGame"
    >
      Empezar partida
    </button>
  </div>
</template>
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`, add 2 players, continue to "Rondas".
Expected: the 3 default rounds are preloaded ("2 tríos"/7, "Trío + escalera"/8, "2 escaleras"/9), each name/card count is editable inline, rounds can be reordered and removed, new rounds can be added, and "Empezar partida" is disabled only when the list is empty. Clicking it shows the "Tablero (pendiente)" placeholder.

- [ ] **Step 3: Commit**

```bash
git add src/components/RoundSetup.vue
git commit -m "feat: add round setup screen"
```

---

### Task 7: Score board screen

**Files:**
- Modify: `src/components/ScoreBoard.vue`
- Create: `src/components/ScoreRow.vue`

**Interfaces:**
- Consumes: `useGameStore()` (`players`, `currentRound`, `currentRoundIndex`, `rounds`, `scores`, `totals`, `isLastRound`, `setScore`, `confirmRound`).
- Produces: `ScoreRow` — props `player: {id, name}`, `value: number | undefined`, `total: number`; emits `update` with the new raw input value.

- [ ] **Step 1: Implement `src/components/ScoreRow.vue`**

```vue
<script setup>
defineProps({
  player: { type: Object, required: true },
  value: { type: Number, default: undefined },
  total: { type: Number, required: true },
})
defineEmits(['update'])
</script>

<template>
  <li class="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm">
    <div>
      <p class="font-medium text-slate-800">{{ player.name }}</p>
      <p class="text-xs text-slate-500">Total: {{ total }}</p>
    </div>
    <input
      :value="value"
      type="number"
      class="w-20 rounded border border-slate-300 px-2 py-1 text-right"
      @input="$emit('update', $event.target.value)"
    />
  </li>
</template>
```

- [ ] **Step 2: Implement `src/components/ScoreBoard.vue`**

```vue
<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import ScoreRow from './ScoreRow.vue'

const store = useGameStore()

const allScoresEntered = computed(() =>
  store.players.every((player) => {
    const roundScores = store.scores[store.currentRound.id]
    return (
      roundScores &&
      typeof roundScores[player.id] === 'number' &&
      !Number.isNaN(roundScores[player.id])
    )
  })
)

function setScore(playerId, value) {
  store.setScore(store.currentRound.id, playerId, Number(value))
}

function confirmRound() {
  if (!allScoresEntered.value) return
  store.confirmRound()
}
</script>

<template>
  <div class="mx-auto max-w-md space-y-4 p-6">
    <div class="text-center">
      <p class="text-sm text-slate-500">
        Ronda {{ store.currentRoundIndex + 1 }} de {{ store.rounds.length }}
      </p>
      <h1 class="text-2xl font-bold text-slate-800">{{ store.currentRound.name }}</h1>
      <p class="text-sm text-slate-500">{{ store.currentRound.cards }} cartas</p>
    </div>

    <ul class="space-y-2">
      <ScoreRow
        v-for="player in store.players"
        :key="player.id"
        :player="player"
        :value="store.scores[store.currentRound.id]?.[player.id]"
        :total="store.totals.find((t) => t.id === player.id)?.total ?? 0"
        @update="setScore(player.id, $event)"
      />
    </ul>

    <button
      type="button"
      :disabled="!allScoresEntered"
      class="w-full rounded-lg bg-emerald-600 px-4 py-3 text-white disabled:opacity-30"
      @click="confirmRound"
    >
      {{ store.isLastRound ? 'Ver podio' : 'Siguiente ronda' }}
    </button>
  </div>
</template>
```

- [ ] **Step 3: Manually verify in the browser**

Run: `npm run dev`, set up 2+ players and rounds, reach the "Tablero" screen.
Expected: current round name/card count shown, one input per player, running total shown per player, the continue button is disabled until every player has a score, and it advances through all rounds. On the last round the button reads "Ver podio" and clicking it shows the "Podio (pendiente)" placeholder.

- [ ] **Step 4: Commit**

```bash
git add src/components/ScoreBoard.vue src/components/ScoreRow.vue
git commit -m "feat: add score board screen"
```

---

### Task 8: Podium screen

**Files:**
- Modify: `src/components/PodiumView.vue`

**Interfaces:**
- Consumes: `useGameStore()` (`podiumResult: { podium, rest }`, `newGame`).

- [ ] **Step 1: Implement `src/components/PodiumView.vue`**

```vue
<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()

const podium = computed(() => store.podiumResult.podium)
const rest = computed(() => store.podiumResult.rest)

const first = computed(() => podium.value.find((p) => p.position === 1))
const second = computed(() => podium.value.find((p) => p.position === 2))
const third = computed(() => podium.value.find((p) => p.position === 3))
</script>

<template>
  <div class="mx-auto max-w-md space-y-8 p-6">
    <h1 class="text-center text-2xl font-bold text-slate-800">🏆 Resultado final</h1>

    <div class="flex items-end justify-center gap-2">
      <div v-if="second" class="flex flex-col items-center">
        <p class="mb-1 text-sm font-medium text-slate-700">{{ second.name }}</p>
        <div class="flex h-20 w-20 items-center justify-center rounded-t-lg bg-slate-300 text-xl font-bold">
          2º
        </div>
        <p class="text-xs text-slate-500">{{ second.total }} pts</p>
      </div>
      <div v-if="first" class="flex flex-col items-center">
        <p class="mb-1 text-sm font-medium text-slate-700">{{ first.name }}</p>
        <div class="flex h-28 w-24 items-center justify-center rounded-t-lg bg-yellow-400 text-2xl font-bold">
          1º
        </div>
        <p class="text-xs text-slate-500">{{ first.total }} pts</p>
      </div>
      <div v-if="third" class="flex flex-col items-center">
        <p class="mb-1 text-sm font-medium text-slate-700">{{ third.name }}</p>
        <div class="flex h-14 w-20 items-center justify-center rounded-t-lg bg-amber-600 text-xl font-bold text-white">
          3º
        </div>
        <p class="text-xs text-slate-500">{{ third.total }} pts</p>
      </div>
    </div>

    <ul v-if="rest.length" class="space-y-2">
      <li
        v-for="entry in rest"
        :key="entry.id"
        class="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm"
      >
        <span>{{ entry.position }}º · {{ entry.name }}</span>
        <span class="text-slate-500">{{ entry.total }} pts</span>
      </li>
    </ul>

    <button
      type="button"
      class="w-full rounded-lg bg-emerald-600 px-4 py-3 text-white"
      @click="store.newGame()"
    >
      Nueva partida
    </button>
  </div>
</template>
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`, play through every round with at least 3 players and distinct scores.
Expected: on the last round, submitting scores navigates straight to the podium; 1st/2nd/3rd are visually highlighted (tallest block for 1st), remaining players listed below in order, and "Nueva partida" returns to the score board (round 1) with the same players/rounds and empty scores. Refreshing the page mid-game (before reaching the podium) preserves the current state.

- [ ] **Step 3: Commit**

```bash
git add src/components/PodiumView.vue
git commit -m "feat: add podium screen"
```

---

### Task 9: Final pass — README and full-flow verification

**Files:**
- Create: `README.md`

**Interfaces:**
- None (documentation + verification only).

- [ ] **Step 1: Write `README.md`**

```md
# Continental

Marcador para partidas del juego de cartas Continental, pensado para un
único móvil/tablet compartido en la mesa. Sin backend: el estado de la
partida se guarda en el navegador (`localStorage`).

## Desarrollo

\`\`\`bash
npm install
npm run dev
\`\`\`

## Tests

\`\`\`bash
npm run test
\`\`\`

## Build de producción

\`\`\`bash
npm run build
npm run preview
\`\`\`
```

- [ ] **Step 2: Run the full automated test suite**

Run: `npm run test`
Expected: all test files pass (`scoring.test.js`, `defaultRounds.test.js`, `game.test.js`).

- [ ] **Step 3: Full manual end-to-end pass in the browser**

Run: `npm run dev`, then in the browser:
1. Add 4 players, reorder them, remove one, continue with 3.
2. Edit a round's name/cards, remove one, add a new one, reorder, start the game.
3. Enter scores for every round, including at least one tie between two players.
4. Confirm the podium shows the correct 1st/2nd/3rd (ties sharing a position) and the rest of the players below.
5. Click "Nueva partida" and confirm players/rounds are kept and scores are reset to the score board.
6. Refresh the page mid-game and confirm the state survives the reload.

Expected: every step behaves as described, with no console errors.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add project README"
```
