<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useTimerStore } from '@/stores/timerStore'
import { useFullscreenBreak } from '@/composables/useFullscreenBreak'
import BreakTimerDisplay from '@/components/timer/BreakTimerDisplay.vue'
import BreakProgressBar from './BreakProgressBar.vue'
import ExerciseCarousel from './ExerciseCarousel.vue'

const timer = useTimerStore()
const { showReturnPrompt, enterFullscreen, reEnterFullscreen, exitFullscreen } = useFullscreenBreak()
const modalRef = ref<HTMLElement | null>(null)
let previouslyFocusedElement: HTMLElement | null = null

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',')

  return Array.from(container.querySelectorAll<HTMLElement>(selector))
}

function trapTab(event: KeyboardEvent) {
  if (event.key !== 'Tab') return

  const container = modalRef.value
  if (!container) return

  const focusable = getFocusableElements(container)
  if (focusable.length === 0) {
    event.preventDefault()
    container.focus()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return
  const active = document.activeElement as HTMLElement | null

  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => timer.isOnBreak,
  async (isBreak) => {
    if (isBreak) {
      previouslyFocusedElement = document.activeElement as HTMLElement | null
      await enterFullscreen()
      await nextTick()
      modalRef.value?.focus()
      return
    }

    await exitFullscreen()
    previouslyFocusedElement?.focus()
  },
)

watch(
  () => timer.breakSecondsRemaining,
  (remaining) => {
    if (remaining <= 0 && timer.isOnBreak) {
      void exitFullscreen()
    }
  },
)

onBeforeUnmount(() => {
  previouslyFocusedElement?.focus()
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
        ref="modalRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="showReturnPrompt ? 'break-return-title' : 'break-title'"
        tabindex="-1"
        class="fixed inset-0 z-[99999] bg-pa-bg flex flex-col"
        @keydown.esc.prevent
        @keydown.tab="trapTab"
      >
        <div
          v-if="showReturnPrompt"
          class="flex-1 flex flex-col items-center justify-center gap-6 p-8"
          aria-live="polite"
        >
          <div class="text-6xl" aria-hidden="true">&#x23f8;</div>
          <h2 id="break-return-title" class="text-2xl font-bold text-white text-center">Tu pausa activa continua</h2>
          <p class="text-pa-text-muted text-center max-w-md">
            Esta pausa es obligatoria segun la Resolucion 1843 de 2025.
            Regresa a pantalla completa para completar tus ejercicios.
          </p>
          <button class="btn-primary text-xl px-10 py-5 rounded-2xl" @click="reEnterFullscreen">
            Continuar en pantalla completa
          </button>
          <div class="mt-4">
            <BreakTimerDisplay />
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <div class="p-6 pb-0 space-y-4">
            <div class="flex items-center justify-between">
              <h2 id="break-title" class="text-lg font-semibold text-pa-accent">Pausa activa</h2>
              <div class="text-right">
                <p class="text-2xl font-bold font-mono text-white">{{ timer.breakTimeFormatted }}</p>
              </div>
            </div>
            <BreakProgressBar
              :seconds-remaining="timer.breakSecondsRemaining"
              :total="timer.breakSecondsRemaining + (600 - timer.breakSecondsRemaining)"
            />
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-6">
            <ExerciseCarousel />
          </div>

          <div class="p-4 text-center border-t border-pa-surface-hover/30">
            <p class="text-xs text-pa-text-muted">
              Resolucion 1843 de 2025 - Sistema de Gestion de Seguridad y Salud en el Trabajo
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
