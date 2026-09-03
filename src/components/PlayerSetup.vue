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
