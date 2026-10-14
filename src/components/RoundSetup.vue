<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()
const newName = ref('')
const newCards = ref(7)
const invalidRoundNameId = ref(null)

function addRound() {
  const name = newName.value.trim()
  if (!name || !newCards.value) return
  if (!store.addRound(name, Number(newCards.value))) return
  newName.value = ''
  newCards.value = 7
}

function startGame() {
  if (store.rounds.length === 0) return
  store.startGame()
}

function updateRoundName(round, event) {
  if (!store.updateRound(round.id, { name: event.target.value })) {
    event.target.value = round.name
    invalidRoundNameId.value = round.id
    return
  }

  event.target.value = round.name
  invalidRoundNameId.value = null
}

function clearRoundNameError(roundId) {
  if (invalidRoundNameId.value === roundId) invalidRoundNameId.value = null
}

function updateCards(roundId, value) {
  const cards = Number(value)
  if (!Number.isInteger(cards) || cards < 1) return
  store.updateRound(roundId, { cards })
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">Rondas</h1>
    <button type="button" class="linkish" @click="store.backToPlayers()">Cambiar jugadores</button>

    <ul class="stack round-list">
      <li v-for="(round, index) in store.rounds" :key="round.id" class="line round-line">
        <label class="field round-name-field">
          <span>Nombre de la ronda</span>
          <input
            :value="round.name"
            type="text"
            maxlength="80"
            :aria-invalid="invalidRoundNameId === round.id"
            :aria-describedby="invalidRoundNameId === round.id ? `round-name-error-${round.id}` : undefined"
            @input="clearRoundNameError(round.id)"
            @change="updateRoundName(round, $event)"
          />
          <span
            v-if="invalidRoundNameId === round.id"
            :id="`round-name-error-${round.id}`"
            class="note"
            aria-live="polite"
          >
            El nombre de la ronda no puede estar vacío.
          </span>
        </label>
        <label class="field cards-field">
          <span>Cartas</span>
          <input
            :value="round.cards"
            type="number"
            min="1"
            inputmode="numeric"
            @input="updateCards(round.id, $event.target.value)"
          />
        </label>
        <div class="line-actions round-actions">
          <button
            type="button"
            class="ghost round-action move-up"
            :disabled="index === 0"
            :aria-label="`Subir ${round.name}`"
            :title="`Subir ${round.name}`"
            @click="store.moveRound(round.id, -1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m5 14 7-7 7 7M12 7v13" />
            </svg>
          </button>
          <button
            type="button"
            class="ghost round-action move-down"
            :disabled="index === store.rounds.length - 1"
            :aria-label="`Bajar ${round.name}`"
            :title="`Bajar ${round.name}`"
            @click="store.moveRound(round.id, 1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m5 10 7 7 7-7M12 17V4" />
            </svg>
          </button>
          <button
            type="button"
            class="ghost round-action remove-round"
            :aria-label="`Quitar ${round.name}`"
            :title="`Quitar ${round.name}`"
            @click="store.removeRound(round.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </svg>
          </button>
        </div>
      </li>
    </ul>

    <form class="add-line" @submit.prevent="addRound">
      <label class="field">
        <span>Nombre</span>
        <input v-model="newName" type="text" maxlength="80" />
      </label>
      <label class="field cards-field">
        <span>Cartas</span>
        <input v-model="newCards" type="number" min="1" inputmode="numeric" />
      </label>
      <button type="submit" class="action-quiet">Añadir</button>
    </form>

    <div class="dock">
      <p v-if="store.rounds.length === 0" class="note" aria-live="polite">
        Añade al menos 1 ronda para empezar.
      </p>
      <button type="button" class="action" :disabled="store.rounds.length === 0" @click="startGame">
        Empezar partida
      </button>
    </div>
  </div>
</template>
