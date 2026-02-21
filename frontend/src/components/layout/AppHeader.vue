<script setup lang="ts">
import { useTimerStore } from '@/stores/timerStore'
import { useAuthStore } from '@/stores/authStore'

const timer = useTimerStore()
const auth = useAuthStore()
</script>

<template>
  <header class="bg-pa-surface/80 backdrop-blur-sm border-b border-pa-surface-hover/30 px-4 py-3 sticky top-0 z-40">
    <div class="max-w-2xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl" aria-hidden="true">&#x1F9D8;</span>
        <h1 class="font-bold text-lg text-white">Pausas Activas</h1>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="timer.isWorking || timer.isPaused" class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" :class="timer.isWorking ? 'bg-pa-success animate-pulse' : 'bg-pa-warning'" />
          <span class="text-sm font-mono text-pa-text-muted">{{ timer.workTimeFormatted }}</span>
        </div>
        <button class="text-xs text-pa-text-muted hover:text-pa-text" @click="auth.logout">
          Salir
        </button>
      </div>
    </div>
  </header>
</template>
