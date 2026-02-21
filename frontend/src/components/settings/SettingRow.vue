<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
  labelId?: string
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <div class="min-w-0">
      <label :id="labelId" class="text-sm font-medium">{{ label }}</label>
      <p v-if="hint" class="text-xs text-pa-text-muted">{{ hint }}</p>
    </div>
    <slot />
  </div>
</template>
