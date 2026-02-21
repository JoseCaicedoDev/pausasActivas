<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  labelledBy: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-labelledby="labelledBy"
    :class="[
      'relative w-12 h-6 rounded-full transition-colors shrink-0',
      modelValue ? 'bg-pa-accent' : 'bg-pa-surface-hover'
    ]"
    @click="toggle"
  >
    <span
      :class="[
        'absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow',
        modelValue ? 'translate-x-6' : 'translate-x-0.5'
      ]"
    />
  </button>
</template>
