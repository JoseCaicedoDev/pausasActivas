<script setup lang="ts">
import { computed } from 'vue'
import { useTimerStore } from '@/stores/timerStore'
import CircularProgress from '@/components/common/CircularProgress.vue'

const timer = useTimerStore()

const progressColor = computed(() => {
  if (timer.workProgress > 0.9) return '#f87171'
  if (timer.workProgress > 0.75) return '#fbbf24'
  return '#38bdf8'
})
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <CircularProgress
      :progress="timer.workProgress"
      :size="240"
      :stroke-width="10"
      :color="progressColor"
      label="Progreso del ciclo de trabajo"
    >
      <div class="text-center">
        <p class="text-4xl font-bold tracking-wider font-mono">
          {{ timer.workTimeFormatted }}
        </p>
        <p class="text-xs text-pa-text-muted mt-1">
          {{ timer.isWorking ? 'Proxima pausa' : timer.isPaused ? 'En pausa' : 'Listo para iniciar' }}
        </p>
      </div>
    </CircularProgress>

    <p v-if="timer.currentCycleNumber > 0" class="text-sm text-pa-text-muted">
      Ciclo {{ timer.currentCycleNumber }}
    </p>
  </div>
</template>
