export type TimerMode = 'idle' | 'working' | 'break' | 'paused'

export interface TimerState {
  mode: TimerMode
  workSecondsRemaining: number
  breakSecondsRemaining: number
  currentCycleNumber: number
  cycleStartedAt: string | null
}
