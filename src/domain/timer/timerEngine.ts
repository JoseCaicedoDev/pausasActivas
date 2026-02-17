import type { TimerMode } from '@/types/timer'

export interface TimerEngineState {
  mode: TimerMode
  workSecondsRemaining: number
  breakSecondsRemaining: number
  cycleStartedAt: string | null
  currentCycleNumber: number
}

export interface TimerTickResult {
  nextSecondsRemaining: number
  completed: boolean
  elapsedSeconds: number
}

function clampSeconds(value: number): number {
  return Math.max(0, Math.floor(value))
}

export function start(totalWorkSeconds: number, currentCycleNumber: number): TimerEngineState {
  return {
    mode: 'working',
    workSecondsRemaining: clampSeconds(totalWorkSeconds),
    breakSecondsRemaining: 0,
    cycleStartedAt: new Date().toISOString(),
    currentCycleNumber: currentCycleNumber + 1,
  }
}

export function pause(state: TimerEngineState): TimerEngineState {
  return {
    ...state,
    mode: 'paused',
  }
}

export function resume(state: TimerEngineState, totalWorkSeconds: number): TimerEngineState {
  const elapsed = Math.max(0, totalWorkSeconds - clampSeconds(state.workSecondsRemaining))
  const adjustedStart = new Date(Date.now() - elapsed * 1000).toISOString()

  return {
    ...state,
    mode: 'working',
    cycleStartedAt: adjustedStart,
  }
}

export function complete(state: TimerEngineState): TimerEngineState {
  return {
    ...state,
    mode: 'idle',
    cycleStartedAt: null,
    breakSecondsRemaining: 0,
  }
}

export function tick(secondsRemaining: number, lastTickTimestampMs: number): TimerTickResult {
  const now = Date.now()
  const elapsedSeconds = Math.max(1, Math.round((now - lastTickTimestampMs) / 1000))
  const nextSecondsRemaining = clampSeconds(secondsRemaining - elapsedSeconds)

  return {
    nextSecondsRemaining,
    completed: nextSecondsRemaining <= 0,
    elapsedSeconds,
  }
}

export function recalculateAfterVisibility(
  cycleStartedAt: string,
  totalWorkSeconds: number,
): number {
  const elapsedSeconds = Math.floor((Date.now() - new Date(cycleStartedAt).getTime()) / 1000)
  return clampSeconds(totalWorkSeconds - elapsedSeconds)
}
