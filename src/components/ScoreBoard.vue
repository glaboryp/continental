<script setup>
import { computed, ref } from 'vue'
import { useGameStore } from '../stores/game'
import ScoreRow from './ScoreRow.vue'

const store = useGameStore()
const newPlayerName = ref('')
const duplicate = ref(false)
const board = ref(null)

const rows = computed(() => {
  return store.roundOrder.map((entry) => ({
    ...entry,
    value: store.scores[store.currentRound.id]?.[entry.id],
  }))
})

const missingNames = computed(() =>
  rows.value
    .filter((row) => typeof row.value !== 'number' || Number.isNaN(row.value))
    .map((row) => row.name),
)

const allScoresEntered = computed(() => missingNames.value.length === 0)
const closeWarning = computed(() =>
  store.isLastRound
    ? 'Al ver el podio, esta puntuación ya no se puede cambiar.'
    : 'Al pasar a la siguiente ronda, esta puntuación ya no se puede cambiar.',
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
  if (!store.addPlayer(name)) {
    duplicate.value = true
    return
  }
  duplicate.value = false
  newPlayerName.value = ''
}

function advance(index) {
  const inputs = board.value?.querySelectorAll('.score-input')
  inputs?.[index + 1]?.focus()
}
</script>

<template>
  <div class="page page-play">
    <div class="play-layout">
      <header class="play-head">
        <p class="play-meta">Ronda {{ store.currentRoundIndex + 1 }} de {{ store.rounds.length }}</p>
        <h1 class="page-title">{{ store.currentRound.name }}</h1>
        <p class="lede">Esta ronda: {{ store.currentRound.cards }} cartas</p>
      </header>

      <ol ref="board" class="board">
        <ScoreRow
          v-for="(row, index) in rows"
          :key="row.id"
          :player="{ id: row.id, name: row.name }"
          :place="row.position"
          :value="row.value"
          :total="row.total"
          @update="setScore(row.id, $event)"
          @advance="advance(index)"
        />
      </ol>

      <details class="adder">
        <summary>Añadir jugador</summary>
        <form class="add-line" @submit.prevent="addPlayer">
          <label class="field">
            <span>Nombre</span>
            <input v-model="newPlayerName" type="text" maxlength="80" autocomplete="name" />
          </label>
          <button type="submit" class="action-quiet">Añadir</button>
        </form>
        <p v-if="duplicate" class="note" aria-live="polite">Ya hay un jugador con ese nombre.</p>
      </details>

      <div class="dock dock-play">
        <p v-if="!allScoresEntered" class="note" aria-live="polite">
          Faltan los puntos de {{ missingNames.join(', ') }}.
        </p>
        <p v-else class="note">{{ closeWarning }}</p>
        <button type="button" class="action" :disabled="!allScoresEntered" @click="confirmRound">
          {{ store.isLastRound ? 'Ver podio' : 'Siguiente ronda' }}
        </button>
      </div>
    </div>
  </div>
</template>
