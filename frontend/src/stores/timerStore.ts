import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { TimerMode } from '@/types/timer'
import { useSettingsStore } from './settingsStore'
import { useExerciseStore } from './exerciseStore'
import { useHistoryStore } from './historyStore'
import { useAuthStore } from './authStore'
import { alarmSound } from '@/services/audioService'
import {
  complete,
  pause,
  recalculateAfterVisibility,
  resume,
  start,
  tick,
  type TimerEngineState,
} from '@/domain/timer/timerEngine'
import {
  clearTimerState,
  loadTimerState,
  saveTimerState,
  type PersistedTimerState,
} from '@/domain/timer/timerPersistence'
import type { AppError } from '@/types/errors'
import { toAppError } from '@/types/errors'

function toEngineState(state: {
  mode: TimerMode
  workSecondsRemaining: number
  breakSecondsRemaining: number
  cycleStartedAt: string | null
  currentCycleNumber: number
}): TimerEngineState {
  return {
    mode: state.mode,
    workSecondsRemaining: state.workSecondsRemaining,
    breakSecondsRemaining: state.breakSecondsRemaining,
    cycleStartedAt: state.cycleStartedAt,
    currentCycleNumber: state.currentCycleNumber,
  }
}

export const useTimerStore = defineStore('timer', () => {
  const mode = ref<TimerMode>('idle')
  const workSecondsRemaining = ref(7200)
  const breakSecondsRemaining = ref(600)
  const currentCycleNumber = ref(0)
  const cycleStartedAt = ref<string | null>(null)
  const currentSessionId = ref<string | null>(null)
  const lastError = ref<AppError | null>(null)

  let workIntervalId: ReturnType<typeof setInterval> | null = null
  let breakIntervalId: ReturnType<typeof setInterval> | null = null
  let lastTickTimestamp = Date.now()
  let exerciseAdvanceAt = 0
  let autoStartTimeoutId: ReturnType<typeof setTimeout> | null = null

  const isIdle = computed(() => mode.value === 'idle')
  const isWorking = computed(() => mode.value === 'working')
  const isPaused = computed(() => mode.value === 'paused')
  const isOnBreak = computed(() => mode.value === 'break')

  const workProgress = computed(() => {
    const settings = useSettingsStore()
    const total = settings.settings.workIntervalMinutes * 60
    return 1 - (workSecondsRemaining.value / total)
  })

  const breakProgress = computed(() => {
    const settings = useSettingsStore()
    const total = settings.settings.breakDurationMinutes * 60
    return 1 - (breakSecondsRemaining.value / total)
  })

  const workTimeFormatted = computed(() => formatTime(workSecondsRemaining.value))
  const breakTimeFormatted = computed(() => formatTime(breakSecondsRemaining.value))

  function getUserId(): string | null {
    return useAuthStore().user?.id ?? null
  }

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function applyEngineState(state: TimerEngineState): void {
    mode.value = state.mode
    workSecondsRemaining.value = state.workSecondsRemaining
    breakSecondsRemaining.value = state.breakSecondsRemaining
    cycleStartedAt.value = state.cycleStartedAt
    currentCycleNumber.value = state.currentCycleNumber
  }

  function persistState(): void {
    const state: PersistedTimerState = {
      mode: mode.value,
      cycleStartedAt: cycleStartedAt.value,
      workSecondsRemaining: workSecondsRemaining.value,
      currentCycleNumber: currentCycleNumber.value,
      breakSecondsRemaining: breakSecondsRemaining.value,
    }
    saveTimerState(getUserId(), state)
  }

  function stopWorkTick(): void {
    if (workIntervalId !== null) {
      clearInterval(workIntervalId)
      workIntervalId = null
    }
  }

  function stopBreakTick(): void {
    if (breakIntervalId !== null) {
      clearInterval(breakIntervalId)
      breakIntervalId = null
    }
  }

  function clearAutoStartTimeout(): void {
    if (autoStartTimeoutId !== null) {
      clearTimeout(autoStartTimeoutId)
      autoStartTimeoutId = null
    }
  }

  function startWorkTick(): void {
    stopWorkTick()
    lastTickTimestamp = Date.now()

    workIntervalId = setInterval(() => {
      const result = tick(workSecondsRemaining.value, lastTickTimestamp)
      lastTickTimestamp = Date.now()
      workSecondsRemaining.value = result.nextSecondsRemaining

      if (result.completed) {
        void triggerBreak()
      }
    }, 1000)
  }

  function startBreakTick(): void {
    stopBreakTick()
    lastTickTimestamp = Date.now()
    const settings = useSettingsStore()
    const totalBreakSeconds = settings.settings.breakDurationMinutes * 60
    let lastAdvancedIndex = 0

    breakIntervalId = setInterval(() => {
      const result = tick(breakSecondsRemaining.value, lastTickTimestamp)
      lastTickTimestamp = Date.now()
      breakSecondsRemaining.value = result.nextSecondsRemaining

      if (exerciseAdvanceAt > 0) {
        const elapsedBreak = totalBreakSeconds - breakSecondsRemaining.value
        const expectedIndex = Math.floor(elapsedBreak / exerciseAdvanceAt)
        if (expectedIndex > lastAdvancedIndex) {
          useExerciseStore().advanceExercise()
          lastAdvancedIndex = expectedIndex
        }
      }

      if (result.completed) {
        void completeBreak()
      }

      persistState()
    }, 1000)
  }

  function restoreState(): void {
    const state = loadTimerState(getUserId())
    if (!state) return

    try {
      if (state.mode === 'working' && state.cycleStartedAt) {
        const settings = useSettingsStore()
        const totalSeconds = settings.settings.workIntervalMinutes * 60
        const remaining = recalculateAfterVisibility(state.cycleStartedAt, totalSeconds)

        if (remaining <= 0) {
          void triggerBreak()
          return
        }

        mode.value = 'working'
        cycleStartedAt.value = state.cycleStartedAt
        workSecondsRemaining.value = remaining
        currentCycleNumber.value = state.currentCycleNumber
        startWorkTick()
        return
      }

      if (state.mode === 'paused') {
        mode.value = 'paused'
        workSecondsRemaining.value = state.workSecondsRemaining
        currentCycleNumber.value = state.currentCycleNumber
        cycleStartedAt.value = state.cycleStartedAt
        return
      }

      if (state.mode === 'break') {
        mode.value = 'break'
        breakSecondsRemaining.value = state.breakSecondsRemaining
        currentCycleNumber.value = state.currentCycleNumber
        useExerciseStore().selectExercisesForBreak()
        startBreakTick()
      }
    } catch (error) {
      lastError.value = toAppError('timer', error, 'No fue posible restaurar el estado del temporizador', 'timer_restore_failed')
    }
  }

  function startWork(): void {
    clearAutoStartTimeout()
    const settings = useSettingsStore()
    const next = start(settings.settings.workIntervalMinutes * 60, currentCycleNumber.value)
    applyEngineState({
      ...next,
      breakSecondsRemaining: settings.settings.breakDurationMinutes * 60,
    })
    startWorkTick()
    persistState()
  }

  function pauseWork(): void {
    if (mode.value !== 'working') return

    stopWorkTick()
    const next = pause(toEngineState({
      mode: mode.value,
      workSecondsRemaining: workSecondsRemaining.value,
      breakSecondsRemaining: breakSecondsRemaining.value,
      cycleStartedAt: cycleStartedAt.value,
      currentCycleNumber: currentCycleNumber.value,
    }))
    applyEngineState(next)
    persistState()
  }

  function resumeWork(): void {
    if (mode.value !== 'paused') return

    const settings = useSettingsStore()
    const next = resume(
      toEngineState({
        mode: mode.value,
        workSecondsRemaining: workSecondsRemaining.value,
        breakSecondsRemaining: breakSecondsRemaining.value,
        cycleStartedAt: cycleStartedAt.value,
        currentCycleNumber: currentCycleNumber.value,
      }),
      settings.settings.workIntervalMinutes * 60,
    )
    applyEngineState(next)
    startWorkTick()
    persistState()
  }

  async function triggerBreak(): Promise<void> {
    stopWorkTick()

    const settings = useSettingsStore()
    const exerciseStore = useExerciseStore()
    const historyStore = useHistoryStore()

    breakSecondsRemaining.value = settings.settings.breakDurationMinutes * 60
    mode.value = 'break'

    try {
      const selected = exerciseStore.selectExercisesForBreak()
      const breakDuration = settings.settings.breakDurationMinutes * 60
      exerciseAdvanceAt = Math.floor(breakDuration / Math.max(1, selected.length))

      alarmSound.playBreakAlarm(settings.settings.alarmVolume)

      currentSessionId.value = await historyStore.startSession(
        selected.map((exercise) => exercise.id),
        breakDuration,
      )
      lastError.value = null
    } catch (error) {
      lastError.value = toAppError('timer', error, 'No fue posible iniciar la pausa activa', 'timer_break_start_failed')
    }

    startBreakTick()
    persistState()
  }

  async function completeBreak(): Promise<void> {
    stopBreakTick()
    const settings = useSettingsStore()
    const historyStore = useHistoryStore()
    const exerciseStore = useExerciseStore()

    try {
      if (currentSessionId.value) {
        await historyStore.completeSession(
          currentSessionId.value,
          settings.settings.breakDurationMinutes * 60,
        )
        currentSessionId.value = null
      }

      alarmSound.playBreakComplete(settings.settings.alarmVolume)
      exerciseStore.reset()
      lastError.value = null
    } catch (error) {
      lastError.value = toAppError('timer', error, 'No fue posible completar la pausa activa', 'timer_break_complete_failed')
    }

    const next = complete(toEngineState({
      mode: mode.value,
      workSecondsRemaining: workSecondsRemaining.value,
      breakSecondsRemaining: breakSecondsRemaining.value,
      cycleStartedAt: cycleStartedAt.value,
      currentCycleNumber: currentCycleNumber.value,
    }))
    applyEngineState(next)

    if (settings.settings.autoStartNextCycle) {
      autoStartTimeoutId = setTimeout(() => {
        startWork()
      }, 2000)
    }

    persistState()
  }

  function recalculateAfterTabVisible(): void {
    if (mode.value !== 'working' || !cycleStartedAt.value) return

    const settings = useSettingsStore()
    const totalSeconds = settings.settings.workIntervalMinutes * 60
    const remaining = recalculateAfterVisibility(cycleStartedAt.value, totalSeconds)
    workSecondsRemaining.value = remaining
    lastTickTimestamp = Date.now()

    if (remaining <= 0) {
      void triggerBreak()
    }
  }

  function resetAll(): void {
    stopWorkTick()
    stopBreakTick()
    clearAutoStartTimeout()

    const settings = useSettingsStore()
    mode.value = 'idle'
    workSecondsRemaining.value = settings.settings.workIntervalMinutes * 60
    breakSecondsRemaining.value = settings.settings.breakDurationMinutes * 60
    currentCycleNumber.value = 0
    cycleStartedAt.value = null
    currentSessionId.value = null
    clearTimerState(getUserId())
  }

  watch(
    () => useSettingsStore().settings.workIntervalMinutes,
    (newValue) => {
      if (mode.value === 'idle') {
        workSecondsRemaining.value = newValue * 60
      }
    },
  )

  return {
    mode,
    workSecondsRemaining,
    breakSecondsRemaining,
    currentCycleNumber,
    isIdle,
    isWorking,
    isPaused,
    isOnBreak,
    workProgress,
    breakProgress,
    workTimeFormatted,
    breakTimeFormatted,
    lastError,
    startWork,
    pauseWork,
    resumeWork,
    triggerBreak,
    completeBreak,
    recalculateAfterTabVisible,
    resetAll,
    restoreState,
  }
})
