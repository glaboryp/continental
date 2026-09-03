<script setup>
import { storeToRefs } from 'pinia'
import { useGameStore } from './stores/game'
import PlayerSetup from './components/PlayerSetup.vue'
import RoundSetup from './components/RoundSetup.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import PodiumView from './components/PodiumView.vue'

const store = useGameStore()
const { phase } = storeToRefs(store)
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <PlayerSetup v-if="phase === 'setup-players'" />
    <RoundSetup v-else-if="phase === 'setup-rounds'" />
    <ScoreBoard v-else-if="phase === 'playing'" />
    <PodiumView v-else-if="phase === 'podium'" />
  </div>
</template>
