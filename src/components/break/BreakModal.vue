<script setup lang="ts">
import { watch } from 'vue'
import { useTimerStore } from '@/stores/timerStore'
import { useFullscreenBreak } from '@/composables/useFullscreenBreak'
import BreakTimerDisplay from '@/components/timer/BreakTimerDisplay.vue'
import BreakProgressBar from './BreakProgressBar.vue'
import ExerciseCarousel from './ExerciseCarousel.vue'

const timer = useTimerStore()
const { showReturnPrompt, enterFullscreen, reEnterFullscreen, exitFullscreen } = useFullscreenBreak()

// Watch for break mode changes
watch(() => timer.isOnBreak, async (isBreak) => {
  if (isBreak) {
    await enterFullscreen()
  } else {
    await exitFullscreen()
  }
})

// Watch for break completion
watch(() => timer.breakSecondsRemaining, (remaining) => {
  if (remaining <= 0 && timer.isOnBreak) {
    exitFullscreen()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-500 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="timer.isOnBreak"
        class="fixed inset-0 z-[99999] bg-pa-bg flex flex-col"
        @keydown.esc.prevent
      >
        <!-- Return from escaped fullscreen -->
        <div v-if="showReturnPrompt" class="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <div class="text-6xl">⏸️</div>
          <h2 class="text-2xl font-bold text-white text-center">Tu pausa activa continua</h2>
          <p class="text-pa-text-muted text-center max-w-md">
            Esta pausa es obligatoria segun la Resolucion 1843 de 2025.
            Regresa a pantalla completa para completar tus ejercicios.
          </p>
          <button
            class="btn-primary text-xl px-10 py-5 rounded-2xl"
            @click="reEnterFullscreen"
          >
            Continuar en Pantalla Completa
          </button>
          <div class="mt-4">
            <BreakTimerDisplay />
          </div>
        </div>

        <!-- Normal break content -->
        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <!-- Top bar: progress + timer -->
          <div class="p-6 pb-0 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-pa-accent">Pausa Activa</h2>
              <div class="text-right">
                <p class="text-2xl font-bold font-mono text-white">{{ timer.breakTimeFormatted }}</p>
              </div>
            </div>
            <BreakProgressBar
              :seconds-remaining="timer.breakSecondsRemaining"
              :total="timer.breakSecondsRemaining + (600 - timer.breakSecondsRemaining)"
            />
          </div>

          <!-- Exercise content (scrollable) -->
          <div class="flex-1 overflow-y-auto px-6 py-6">
            <ExerciseCarousel />
          </div>

          <!-- Bottom info -->
          <div class="p-4 text-center border-t border-pa-surface-hover/30">
            <p class="text-xs text-pa-text-muted">
              Resolucion 1843 de 2025 · Sistema de Gestion de Seguridad y Salud en el Trabajo
            </p>
            <p class="text-xs text-pa-warning/70 mt-1">
              Si siente dolor intenso, suspenda el ejercicio inmediatamente.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
