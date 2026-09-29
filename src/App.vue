<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from './stores/game'
import { getInitialTheme, THEME_STORAGE_KEY } from './utils/theme'
import PlayerSetup from './components/PlayerSetup.vue'
import RoundSetup from './components/RoundSetup.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import PodiumView from './components/PodiumView.vue'

const store = useGameStore()
const { phase } = storeToRefs(store)
const confirmReset = ref(false)
const theme = ref(getInitialTheme())

function applyTheme(nextTheme, save = false) {
  theme.value = nextTheme
  document.documentElement.dataset.theme = nextTheme

  if (save) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // The selected theme still applies if storage is unavailable.
    }
  }
}

applyTheme(theme.value)

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark', true)
}

function eraseGame() {
  store.resetGame()
  confirmReset.value = false
}
</script>

<template>
  <div class="sheet">
    <button
      type="button"
      class="theme-toggle ghost"
      :aria-label="theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'"
      :title="theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      @click="toggleTheme"
    >
      <svg
        v-if="theme === 'dark'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.72 5.28l-1.42 1.42M6.7 17.3l-1.42 1.42M18.72 18.72l-1.42-1.42M6.7 6.7 5.28 5.28" />
      </svg>
      <svg
        v-else
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M20.2 15.1A8.6 8.6 0 0 1 8.9 3.8 8.6 8.6 0 1 0 20.2 15.1Z" />
      </svg>
    </button>

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
