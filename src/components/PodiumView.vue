<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()

const podium = computed(() => {
  const entries = store.podiumResult.podium
  const byPlace = (position) => entries.filter((entry) => entry.position === position)
  return [...byPlace(2), ...byPlace(1), ...byPlace(3)]
})

const rest = computed(() => store.podiumResult.rest)

const confetti = [
  { x: '-42%', drift: '-3.5rem', delay: '0ms', duration: '2600ms', rotation: '-18deg', color: 'var(--margin)' },
  { x: '-34%', drift: '2rem', delay: '180ms', duration: '2900ms', rotation: '24deg', color: 'var(--ink)' },
  { x: '-25%', drift: '-1.5rem', delay: '360ms', duration: '2400ms', rotation: '8deg', color: 'var(--rule)' },
  { x: '-16%', drift: '3rem', delay: '80ms', duration: '3100ms', rotation: '-32deg', color: 'var(--margin)' },
  { x: '-8%', drift: '-2.5rem', delay: '460ms', duration: '2500ms', rotation: '42deg', color: 'var(--ink)' },
  { x: '0%', drift: '1.25rem', delay: '260ms', duration: '2800ms', rotation: '-8deg', color: 'var(--margin)' },
  { x: '8%', drift: '-2rem', delay: '560ms', duration: '3000ms', rotation: '28deg', color: 'var(--rule)' },
  { x: '16%', drift: '3.5rem', delay: '140ms', duration: '2450ms', rotation: '-24deg', color: 'var(--ink)' },
  { x: '25%', drift: '-1rem', delay: '400ms', duration: '2850ms', rotation: '16deg', color: 'var(--margin)' },
  { x: '34%', drift: '2.5rem', delay: '40ms', duration: '3200ms', rotation: '-40deg', color: 'var(--rule)' },
  { x: '42%', drift: '-3rem', delay: '300ms', duration: '2700ms', rotation: '34deg', color: 'var(--ink)' },
]
</script>

<template>
  <div class="page">
    <h1 class="page-title">Resultado</h1>
    <p class="lede">Menos puntos gana.</p>

    <div class="podium-celebration">
      <div class="confetti" aria-hidden="true">
        <i v-for="(piece, index) in confetti" :key="index" class="confetti-piece" :style="{
          '--x': piece.x,
          '--drift': piece.drift,
          '--delay': piece.delay,
          '--duration': piece.duration,
          '--rotation': piece.rotation,
          '--confetti-color': piece.color,
        }" />
      </div>
      <div class="podium">
        <div
          v-for="entry in podium"
          :key="entry.id"
          class="podium-slot"
          :class="`pos-${Math.min(entry.position, 3)}`"
        >
          <span class="podium-place">{{ entry.position }}º</span>
          <span class="podium-name">{{ entry.name }}</span>
          <span class="podium-points">{{ entry.total }} pts</span>
        </div>
      </div>
    </div>

    <ul v-if="rest.length" class="rest">
      <li v-for="entry in rest" :key="entry.id">
        <span>{{ entry.position }}º {{ entry.name }}</span>
        <span>{{ entry.total }} pts</span>
      </li>
    </ul>

    <div class="end-actions">
      <button type="button" class="action-quiet" @click="store.newGame()">
        Nueva partida con la misma configuración
      </button>
      <button type="button" class="action-quiet" @click="store.changePlayers()">Cambiar jugadores</button>
    </div>
  </div>
</template>
