<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()

const podium = computed(() => store.podiumResult.podium)
const rest = computed(() => store.podiumResult.rest)
</script>

<template>
  <div class="mx-auto max-w-md space-y-8 p-6">
    <h1 class="text-center text-2xl font-bold text-slate-800">🏆 Resultado final</h1>

    <div class="flex items-end justify-center gap-2">
      <div
        v-for="(entry, index) in podium"
        :key="entry.id"
        class="flex flex-col items-center"
      >
        <p class="mb-1 text-sm font-medium text-slate-700">{{ entry.name }}</p>
        <div
          class="flex items-center justify-center rounded-t-lg font-bold"
          :class="{
            'h-28 w-24 bg-yellow-400 text-2xl': entry.position === 1,
            'h-20 w-20 bg-slate-300 text-xl': entry.position === 2,
            'h-14 w-20 bg-amber-600 text-xl text-white': entry.position >= 3,
          }"
        >
          {{ entry.position }}º
        </div>
        <p class="text-xs text-slate-500">{{ entry.total }} pts</p>
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
