import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { TimerMode } from '@/types/timer'
import { useSettingsStore } from './settingsStore'
import { useExerciseStore } from './exerciseStore'
import { useHistoryStore } from './historyStore'
import { alarmSound } from '@/services/audioService'

const TIMER_STATE_KEY = 'pausas-activas-timer-state'

interface PersistedTimerState {
  mode: TimerMode
  cycleStartedAt: string | null
  workSecondsRemaining: number
  currentCycleNumber: number
  breakSecondsRemaining: number
}

export const useTimerStore = defineStore('timer', () => {
  const mode = ref<TimerMode>('idle')
  const workSecondsRemaining = ref(7200)
  const breakSecondsRemaining = ref(600)
  const currentCycleNumber = ref(0)
  const cycleStartedAt = ref<string | null>(null)
  const currentSessionId = ref<string | null>(null)

  let workIntervalId: ReturnType<typeof setInterval> | null = null
  let breakIntervalId: ReturnType<typeof setInterval> | null = null
  let lastTickTimestamp = Date.now()
  let exerciseAdvanceAt = 0

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

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function persistState(): void {
    const state: PersistedTimerState = {
      mode: mode.value,
      cycleStartedAt: cycleStartedAt.value,
      workSecondsRemaining: workSecondsRemaining.value,
      currentCycleNumber: currentCycleNumber.value,
      breakSecondsRemaining: breakSecondsRemaining.value,
    }
    localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state))
  }

  function restoreState(): void {
    const saved = localStorage.getItem(TIMER_STATE_KEY)
    if (!saved) return

    try {
      const state: PersistedTimerState = JSON.parse(saved)

      if (state.mode === 'working' && state.cycleStartedAt) {
        const settings = useSettingsStore()
        const totalSeconds = settings.settings.workIntervalMinutes * 60
        const elapsed = Math.floor((Date.now() - new Date(state.cycleStartedAt).getTime()) / 1000)
        const remaining = Math.max(0, totalSeconds - elapsed)

        if (remaining <= 0) {
          triggerBreak()
        } else {
          mode.value = 'working'
          cycleStartedAt.value = state.cycleStartedAt
          workSecondsRemaining.value = remaining
          currentCycleNumber.value = state.currentCycleNumber
          startWorkTick()
        }
      } else if (state.mode === 'paused') {
        mode.value = 'paused'
        workSecondsRemaining.value = state.workSecondsRemaining
        currentCycleNumber.value = state.currentCycleNumber
        cycleStartedAt.value = state.cycleStartedAt
      } else if (state.mode === 'break') {
        mode.value = 'break'
        breakSecondsRemaining.value = state.breakSecondsRemaining
        currentCycleNumber.value = state.currentCycleNumber
        const exerciseStore = useExerciseStore()
        exerciseStore.selectExercisesForBreak()
        startBreakTick()
      }
    } catch {
      // Corrupted state, start fresh
    }
  }

  function startWork(): void {
    const settings = useSettingsStore()
    workSecondsRemaining.value = settings.settings.workIntervalMinutes * 60
    cycleStartedAt.value = new Date().toISOString()
    currentCycleNumber.value++
    mode.value = 'working'
    startWorkTick()
    persistState()
  }

  function pauseWork(): void {
    if (mode.value !== 'working') return
    stopWorkTick()
    mode.value = 'paused'
    persistState()
  }

  function resumeWork(): void {
    if (mode.value !== 'paused') return

    // Adjust cycleStartedAt to account for paused time
    const settings = useSettingsStore()
    const totalSeconds = settings.settings.workIntervalMinutes * 60
    const newStart = new Date(Date.now() - (totalSeconds - workSecondsRemaining.value) * 1000)
    cycleStartedAt.value = newStart.toISOString()

    mode.value = 'working'
    startWorkTick()
    persistState()
  }

  function startWorkTick(): void {
    stopWorkTick()
    lastTickTimestamp = Date.now()
    workIntervalId = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.round((now - lastTickTimestamp) / 1000)
      lastTickTimestamp = now
      workSecondsRemaining.value = Math.max(0, workSecondsRemaining.value - elapsed)

      if (workSecondsRemaining.value <= 0) {
        triggerBreak()
      }
    }, 1000)
  }

  function stopWorkTick(): void {
    if (workIntervalId !== null) {
      clearInterval(workIntervalId)
      workIntervalId = null
    }
  }

  async function triggerBreak(): Promise<void> {
    stopWorkTick()
    const settings = useSettingsStore()
    const exerciseStore = useExerciseStore()
    const historyStore = useHistoryStore()

    breakSecondsRemaining.value = settings.settings.breakDurationMinutes * 60
    mode.value = 'break'

    const selected = exerciseStore.selectExercisesForBreak()
    const breakDuration = settings.settings.breakDurationMinutes * 60
    exerciseAdvanceAt = Math.floor(breakDuration / selected.length)

    alarmSound.playBreakAlarm(settings.settings.alarmVolume)

    currentSessionId.value = await historyStore.startSession(
      selected.map(e => e.id),
      breakDuration,
    )

    startBreakTick()
    persistState()
  }

  function startBreakTick(): void {
    stopBreakTick()
    lastTickTimestamp = Date.now()
    const settings = useSettingsStore()
    const totalBreakSeconds = settings.settings.breakDurationMinutes * 60
    let lastAdvanceCheck = totalBreakSeconds

    breakIntervalId = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.round((now - lastTickTimestamp) / 1000)
      lastTickTimestamp = now
      breakSecondsRemaining.value = Math.max(0, breakSecondsRemaining.value - elapsed)

      // Advance exercise at intervals
      if (exerciseAdvanceAt > 0) {
        const elapsedBreak = totalBreakSeconds - breakSecondsRemaining.value
        const expectedIndex = Math.floor(elapsedBreak / exerciseAdvanceAt)
        if (expectedIndex > lastAdvanceCheck) {
          const exerciseStore = useExerciseStore()
          exerciseStore.advanceExercise()
          lastAdvanceCheck = expectedIndex
        }
      }

      if (breakSecondsRemaining.value <= 0) {
        completeBreak()
      }

      persistState()
    }, 1000)
  }

  function stopBreakTick(): void {
    if (breakIntervalId !== null) {
      clearInterval(breakIntervalId)
      breakIntervalId = null
    }
  }

  async function completeBreak(): Promise<void> {
    stopBreakTick()
    const settings = useSettingsStore()
    const historyStore = useHistoryStore()
    const exerciseStore = useExerciseStore()

    if (currentSessionId.value) {
      await historyStore.completeSession(
        currentSessionId.value,
        settings.settings.breakDurationMinutes * 60,
      )
      currentSessionId.value = null
    }

    alarmSound.playBreakComplete(settings.settings.alarmVolume)
    exerciseStore.reset()

    if (settings.settings.autoStartNextCycle) {
      mode.value = 'idle'
      // Brief pause before starting next cycle
      setTimeout(() => startWork(), 2000)
    } else {
      mode.value = 'idle'
    }

    persistState()
  }

  function resetAll(): void {
    stopWorkTick()
    stopBreakTick()
    const settings = useSettingsStore()
    mode.value = 'idle'
    workSecondsRemaining.value = settings.settings.workIntervalMinutes * 60
    breakSecondsRemaining.value = settings.settings.breakDurationMinutes * 60
    currentCycleNumber.value = 0
    cycleStartedAt.value = null
    currentSessionId.value = null
    localStorage.removeItem(TIMER_STATE_KEY)
  }

  // Visibility change handler: recalculate on tab return
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && mode.value === 'working' && cycleStartedAt.value) {
        const settings = useSettingsStore()
        const totalSeconds = settings.settings.workIntervalMinutes * 60
        const elapsed = Math.floor((Date.now() - new Date(cycleStartedAt.value).getTime()) / 1000)
        const remaining = Math.max(0, totalSeconds - elapsed)
        workSecondsRemaining.value = remaining
        lastTickTimestamp = Date.now()

        if (remaining <= 0) {
          triggerBreak()
        }
      }
    })
  }

  // Watch settings changes to update total work time
  watch(() => useSettingsStore().settings.workIntervalMinutes, (newVal) => {
    if (mode.value === 'idle') {
      workSecondsRemaining.value = newVal * 60
    }
  })

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
    startWork,
    pauseWork,
    resumeWork,
    triggerBreak,
    completeBreak,
    resetAll,
    restoreState,
  }
})
