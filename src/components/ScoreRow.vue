<script setup>
defineProps({
  player: { type: Object, required: true },
  place: { type: Number, required: true },
  value: { type: Number, default: undefined },
  total: { type: Number, required: true },
})
const emit = defineEmits(['update', 'advance'])

function onInput(event) {
  const digits = event.target.value.replace(/\D/g, '')
  if (event.target.value !== digits) event.target.value = digits
  emit('update', digits)
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
        :value="value"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="off"
        :aria-label="`Puntos de ${player.name} en esta mano`"
        @input="onInput"
        @keydown.enter.prevent="emit('advance')"
      />
    </label>
  </li>
</template>
