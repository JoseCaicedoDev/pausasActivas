<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  secondsRemaining: number
  total: number
}>()

const progress = computed(() => {
  if (props.total <= 0) return 0
  return Math.max(0, Math.min(100, ((props.total - props.secondsRemaining) / props.total) * 100))
})
</script>

<template>
  <div class="w-full">
    <div class="h-2 bg-pa-surface rounded-full overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-pa-accent to-pa-success rounded-full transition-all duration-1000 ease-linear"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>
