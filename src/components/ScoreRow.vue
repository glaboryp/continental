<script setup>
defineProps({
  player: { type: Object, required: true },
  value: { type: Number, default: undefined },
  total: { type: Number, required: true },
})
defineEmits(['update'])
</script>

<template>
  <li class="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm">
    <div>
      <p class="font-medium text-slate-800">{{ player.name }}</p>
      <p class="text-xs text-slate-500">Total: {{ total }}</p>
    </div>
    <input
      :value="value"
      type="number"
      class="w-20 rounded border border-slate-300 px-2 py-1 text-right"
      @input="$emit('update', $event.target.value)"
    />
  </li>
</template>
