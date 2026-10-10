<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  player: { type: Object, required: true },
  place: { type: Number, required: true },
  value: { type: Number, default: undefined },
  total: { type: Number, required: true },
})
const emit = defineEmits(['update', 'advance'])

const pendingMinus = ref(false)
const displayValue = computed(() => (pendingMinus.value ? '-' : props.value))

function onInput(event) {
  const raw = event.target.value
  const cleaned = (raw.startsWith('-') ? '-' : '') + raw.replace(/\D/g, '')
  pendingMinus.value = cleaned === '-'
  if (raw !== cleaned) event.target.value = cleaned
  emit('update', cleaned)
}
</script>

<template>
  <li class="score-row" @focusin="$event.currentTarget.classList.add('is-writing')" @focusout="$event.currentTarget.classList.remove('is-writing')">
    <div class="identity">
      <span class="who">
        <span class="place">{{ place }}º</span>
        <span class="name">{{ player.name }}</span>
      </span>
      <span class="total">{{ total }}<small>total</small></span>
    </div>
    <label class="score-entry">
      <span>Esta mano</span>
      <input
        class="score-input"
        :value="displayValue"
        type="text"
        pattern="-?[0-9]*"
        autocomplete="off"
        :aria-label="`Puntos de ${player.name} en esta mano`"
        @input="onInput"
        @keydown.enter.prevent="emit('advance')"
      />
    </label>
  </li>
</template>
