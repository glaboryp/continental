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
    clearScore(roundId, playerId) {
      if (this.scores[roundId]) delete this.scores[roundId][playerId]
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
