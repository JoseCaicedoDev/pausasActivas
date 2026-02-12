<script setup lang="ts">
import { useTimerStore } from '@/stores/timerStore'

const timer = useTimerStore()
</script>

<template>
  <header class="bg-pa-surface/80 backdrop-blur-sm border-b border-pa-surface-hover/30 px-4 py-3 sticky top-0 z-40">
    <div class="max-w-2xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl">🧘</span>
        <h1 class="font-bold text-lg text-white">Pausas Activas</h1>
      </div>
      <div v-if="timer.isWorking || timer.isPaused" class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="timer.isWorking ? 'bg-pa-success animate-pulse' : 'bg-pa-warning'" />
        <span class="text-sm font-mono text-pa-text-muted">{{ timer.workTimeFormatted }}</span>
      </div>
    </div>
  </header>
</template>
