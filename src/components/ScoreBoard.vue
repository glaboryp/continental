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
  if (value === '') {
    store.clearScore(store.currentRound.id, playerId)
    return
  }
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
