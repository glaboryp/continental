<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

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
  <div class="mx-auto max-w-2xl space-y-4 p-6">
    <div class="text-center">
      <p class="text-sm text-slate-500">
        Ronda {{ store.currentRoundIndex + 1 }} de {{ store.rounds.length }}
      </p>
      <h1 class="text-2xl font-bold text-slate-800">{{ store.currentRound.name }}</h1>
      <p class="text-sm text-slate-500">{{ store.currentRound.cards }} cartas</p>
    </div>

    <div class="overflow-x-auto rounded-lg bg-white shadow-sm">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-800">
              Jugador
            </th>
            <th
              v-for="round in store.rounds"
              :key="round.id"
              class="whitespace-nowrap px-3 py-2 text-center font-medium text-slate-800"
              :class="{ 'bg-emerald-50': round.id === store.currentRound.id }"
            >
              {{ round.name }}
            </th>
            <th class="whitespace-nowrap px-3 py-2 text-right font-medium text-slate-800">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in store.players" :key="player.id" class="border-b border-slate-100 last:border-b-0">
            <td class="whitespace-nowrap px-3 py-2 font-medium text-slate-800">
              {{ player.name }}
            </td>
            <td
              v-for="round in store.rounds"
              :key="round.id"
              class="px-3 py-2 text-center"
              :class="{ 'bg-emerald-50': round.id === store.currentRound.id }"
            >
              <input
                v-if="round.id === store.currentRound.id"
                :value="store.scores[round.id]?.[player.id]"
                type="number"
                class="w-16 rounded border border-slate-300 px-2 py-1 text-right"
                @input="setScore(player.id, $event.target.value)"
              />
              <span v-else class="text-slate-600">
                {{ store.scores[round.id]?.[player.id] ?? '–' }}
              </span>
            </td>
            <td class="whitespace-nowrap px-3 py-2 text-right font-semibold text-slate-800">
              {{ store.totals.find((t) => t.id === player.id)?.total ?? 0 }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="rounded-lg bg-white p-3 shadow-sm">
      <h2 class="mb-2 text-sm font-semibold text-slate-800">Clasificación</h2>
      <ol class="space-y-1">
        <li
          v-for="entry in store.standings"
          :key="entry.id"
          class="flex justify-between text-sm text-slate-600"
        >
          <span>{{ entry.position }}º · {{ entry.name }}</span>
          <span>{{ entry.total }} pts</span>
        </li>
      </ol>
    </div>

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
