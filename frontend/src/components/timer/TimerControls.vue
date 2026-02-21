<script setup lang="ts">
import { useTimerStore } from '@/stores/timerStore'

const timer = useTimerStore()
</script>

<template>
  <div class="flex items-center justify-center gap-4">
    <!-- Idle state: Start button -->
    <button
      v-if="timer.isIdle"
      class="btn-primary text-lg px-8 py-4 rounded-2xl"
      @click="timer.startWork()"
    >
      Iniciar Jornada
    </button>

    <!-- Working state: Pause button -->
    <button
      v-if="timer.isWorking"
      class="btn-secondary px-6 py-3"
      @click="timer.pauseWork()"
    >
      Pausar
    </button>

    <!-- Paused state: Resume and Reset -->
    <template v-if="timer.isPaused">
      <button
        class="btn-primary px-6 py-3"
        @click="timer.resumeWork()"
      >
        Reanudar
      </button>
      <button
        class="btn-secondary px-6 py-3"
        @click="timer.resetAll()"
      >
        Reiniciar
      </button>
    </template>

    <!-- Working: manual break trigger (for testing or voluntary break) -->
    <button
      v-if="timer.isWorking"
      class="text-sm text-pa-text-muted hover:text-pa-accent transition-colors underline"
      @click="timer.triggerBreak()"
    >
      Tomar pausa ahora
    </button>
  </div>
</template>
