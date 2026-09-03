<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()

const podium = computed(() => store.podiumResult.podium)
const rest = computed(() => store.podiumResult.rest)

const first = computed(() => podium.value.find((p) => p.position === 1))
const second = computed(() => podium.value.find((p) => p.position === 2))
const third = computed(() => podium.value.find((p) => p.position === 3))
</script>

<template>
  <div class="mx-auto max-w-md space-y-8 p-6">
    <h1 class="text-center text-2xl font-bold text-slate-800">🏆 Resultado final</h1>

    <div class="flex items-end justify-center gap-2">
      <div v-if="second" class="flex flex-col items-center">
        <p class="mb-1 text-sm font-medium text-slate-700">{{ second.name }}</p>
        <div class="flex h-20 w-20 items-center justify-center rounded-t-lg bg-slate-300 text-xl font-bold">
          2º
        </div>
        <p class="text-xs text-slate-500">{{ second.total }} pts</p>
      </div>
      <div v-if="first" class="flex flex-col items-center">
        <p class="mb-1 text-sm font-medium text-slate-700">{{ first.name }}</p>
        <div class="flex h-28 w-24 items-center justify-center rounded-t-lg bg-yellow-400 text-2xl font-bold">
          1º
        </div>
        <p class="text-xs text-slate-500">{{ first.total }} pts</p>
      </div>
      <div v-if="third" class="flex flex-col items-center">
        <p class="mb-1 text-sm font-medium text-slate-700">{{ third.name }}</p>
        <div class="flex h-14 w-20 items-center justify-center rounded-t-lg bg-amber-600 text-xl font-bold text-white">
          3º
        </div>
        <p class="text-xs text-slate-500">{{ third.total }} pts</p>
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
