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

function updateCards(roundId, value) {
  if (value === '') return
  store.updateRound(roundId, { cards: Number(value) })
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
          @input="updateCards(round.id, $event.target.value)"
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
