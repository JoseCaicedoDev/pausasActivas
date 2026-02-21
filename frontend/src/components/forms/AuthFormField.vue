<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    label: string
    modelValue: string
    type?: 'email' | 'password' | 'text'
    name?: string
    autocomplete?: string
    spellcheck?: boolean
    required?: boolean
  }>(),
  {
    type: 'text',
    required: true,
    spellcheck: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="space-y-1">
    <label :for="id" class="text-sm text-pa-text-muted">{{ label }}</label>
    <input
      :id="id"
      :name="name"
      :type="type"
      :value="modelValue"
      :autocomplete="autocomplete"
      :spellcheck="spellcheck"
      :required="required"
      class="w-full rounded-xl border border-pa-surface-hover bg-pa-bg px-3 py-2 text-sm"
      @input="onInput"
    />
  </div>
</template>
