<script setup lang="ts">
import { useTimerStore } from '@/stores/timerStore'

const timer = useTimerStore()
</script>

<template>
  <div class="text-center">
    <p class="text-6xl font-bold tracking-wider font-mono text-pa-accent">
      {{ timer.breakTimeFormatted }}
    </p>
    <p class="text-sm text-pa-text-muted mt-2">Tiempo restante de pausa</p>
  </div>
</template>
