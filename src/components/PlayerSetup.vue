<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()
const newName = ref('')
const duplicate = ref(false)

function addPlayer() {
  const name = newName.value.trim()
  if (!name) return
  if (!store.addPlayer(name)) {
    duplicate.value = true
    return
  }
  duplicate.value = false
  newName.value = ''
}

function rename(player, event) {
  if (!store.updatePlayer(player.id, event.target.value)) {
    event.target.value = player.name
    duplicate.value = true
    return
  }
  duplicate.value = false
}

function continueToRounds() {
  if (store.players.length < 2) return
  store.goToRoundSetup()
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">Jugadores</h1>
    <p class="lede">Menos puntos gana.</p>

    <ul class="stack">
      <li v-for="player in store.players" :key="player.id" class="line player-line">
        <input
          :value="player.name"
          type="text"
          maxlength="80"
          :aria-label="`Nombre de ${player.name}`"
          @change="rename(player, $event)"
        />
        <div class="line-actions">
          <button
            type="button"
            class="ghost remove-player"
            :aria-label="`Quitar a ${player.name}`"
            :title="`Quitar a ${player.name}`"
            @click="store.removePlayer(player.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </svg>
          </button>
        </div>
      </li>
    </ul>

    <form class="add-line" @submit.prevent="addPlayer">
      <label class="field">
        <span>Nombre</span>
        <input v-model="newName" type="text" maxlength="80" autocomplete="name" />
      </label>
      <button type="submit" class="action-quiet">Añadir</button>
    </form>
    <p v-if="duplicate" class="note" aria-live="polite">Ya hay un jugador con ese nombre.</p>

    <div class="dock">
      <p v-if="store.players.length < 2" class="note">Añade al menos 2 jugadores para empezar.</p>
      <button type="button" class="action" :disabled="store.players.length < 2" @click="continueToRounds">
        Continuar
      </button>
    </div>
  </div>
</template>
