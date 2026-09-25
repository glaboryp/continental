<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from './stores/game'
import PlayerSetup from './components/PlayerSetup.vue'
import RoundSetup from './components/RoundSetup.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import PodiumView from './components/PodiumView.vue'

const store = useGameStore()
const { phase } = storeToRefs(store)
const confirmReset = ref(false)

function eraseGame() {
  store.resetGame()
  confirmReset.value = false
}
</script>

<template>
  <div class="sheet">
    <PlayerSetup v-if="phase === 'setup-players'" />
    <RoundSetup v-else-if="phase === 'setup-rounds'" />
    <ScoreBoard v-else-if="phase === 'playing'" />
    <PodiumView v-else-if="phase === 'podium'" />

    <div class="danger-zone">
      <div v-if="confirmReset" class="confirm" role="alertdialog" aria-live="assertive">
        <p>Se borrarán la partida, los jugadores y todas las puntuaciones.</p>
        <div class="confirm-actions">
          <button type="button" class="action-quiet" @click="eraseGame">Borrar partida</button>
          <button type="button" class="action-quiet" @click="confirmReset = false">Conservar partida</button>
        </div>
      </div>
      <button v-else type="button" class="linkish" @click="confirmReset = true">Borrar partida</button>
    </div>
  </div>
</template>
