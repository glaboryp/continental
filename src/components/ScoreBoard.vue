<script setup>
import { computed, ref } from 'vue'
import { useGameStore } from '../stores/game'
import ScoreRow from './ScoreRow.vue'

const store = useGameStore()
const newPlayerName = ref('')

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

function addPlayer() {
  const name = newPlayerName.value.trim()
  if (!name) return
  store.addPlayer(name)
  newPlayerName.value = ''
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

    <form class="flex gap-2" @submit.prevent="addPlayer">
      <input
        v-model="newPlayerName"
        type="text"
        placeholder="Añadir jugador a mitad de partida"
        class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <button type="submit" class="rounded-lg bg-slate-800 px-4 py-2 text-white">
        Añadir
      </button>
    </form>

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
