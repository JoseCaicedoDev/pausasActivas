import type { TimerMode } from '@/types/timer'

export interface PersistedTimerState {
  mode: TimerMode
  cycleStartedAt: string | null
  workSecondsRemaining: number
  currentCycleNumber: number
  breakSecondsRemaining: number
}

function timerStorageKey(userId: string | null | undefined): string {
  return `pausas-activas:${userId ?? 'anonymous'}:timer-state`
}

export function saveTimerState(userId: string | null | undefined, state: PersistedTimerState): void {
  localStorage.setItem(timerStorageKey(userId), JSON.stringify(state))
}

export function loadTimerState(userId: string | null | undefined): PersistedTimerState | null {
  const raw = localStorage.getItem(timerStorageKey(userId))
  if (!raw) return null

  try {
    return JSON.parse(raw) as PersistedTimerState
  } catch {
    return null
  }
}

export function clearTimerState(userId: string | null | undefined): void {
  localStorage.removeItem(timerStorageKey(userId))
}
