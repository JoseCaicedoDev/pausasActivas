<script setup lang="ts">
type SelectOption = {
  value: number
  label: string
}

defineProps<{
  id: string
  modelValue: number
  options: SelectOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function handleChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value)
  emit('update:modelValue', value)
}
</script>

<template>
  <select
    :id="id"
    :value="modelValue"
    class="bg-pa-bg border border-pa-surface-hover rounded-lg px-3 py-1.5 text-sm text-pa-text"
    @change="handleChange"
  >
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>
