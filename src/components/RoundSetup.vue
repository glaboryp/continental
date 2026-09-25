<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()
const newName = ref('')
const newCards = ref(7)

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
      <li v-for="round in store.rounds" :key="round.id" class="line">
        <label class="field">
          <span>Nombre de la ronda</span>
          <input
            :value="round.name"
            type="text"
            maxlength="80"
            @input="store.updateRound(round.id, { name: $event.target.value })"
          />
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
      </li>
    </ul>

    <details v-if="store.rounds.length" class="round-tools">
      <summary>Ordenar o quitar rondas</summary>
      <ul class="stack">
        <li v-for="(round, index) in store.rounds" :key="`tools-${round.id}`" class="line round-tool">
          <span class="written">{{ round.name }}</span>
          <div class="line-actions">
            <button type="button" class="ghost" :disabled="index === 0" @click="store.moveRound(round.id, -1)">
              Subir
            </button>
            <button
              type="button"
              class="ghost"
              :disabled="index === store.rounds.length - 1"
              @click="store.moveRound(round.id, 1)"
            >
              Bajar
            </button>
            <button type="button" class="ghost" @click="store.removeRound(round.id)">Quitar</button>
          </div>
        </li>
      </ul>
    </details>

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
