<script setup>
import { storeToRefs } from 'pinia'
import { useGameStore } from './stores/game'
import PlayerSetup from './components/PlayerSetup.vue'
import RoundSetup from './components/RoundSetup.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import PodiumView from './components/PodiumView.vue'

const store = useGameStore()
const { phase } = storeToRefs(store)

function resetGame() {
  if (!confirm('¿Seguro que quieres empezar una nueva partida? Se perderá la partida en curso.')) return
  store.resetGame()
}
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
      <span class="font-bold text-slate-800">Continental</span>
      <button type="button" class="text-sm font-medium text-slate-600 underline" @click="resetGame">
        Reiniciar todo
      </button>
    </header>

    <PlayerSetup v-if="phase === 'setup-players'" />
    <RoundSetup v-else-if="phase === 'setup-rounds'" />
    <ScoreBoard v-else-if="phase === 'playing'" />
    <PodiumView v-else-if="phase === 'podium'" />
  </div>
</template>
