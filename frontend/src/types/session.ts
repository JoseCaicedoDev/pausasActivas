export interface BreakSession {
  id: string
  date: string
  startedAt: string
  completedAt: string | null
  completed: boolean
  exerciseIds: string[]
  durationPlannedSeconds: number
  durationActualSeconds: number
}

export interface DailyRecord {
  date: string
  sessionsExpected: number
  sessionsStarted: number
  sessionsCompleted: number
  compliancePercent: number
  sessions: BreakSession[]
}

export interface ComplianceStats {
  totalDays: number
  averageCompliance: number
  currentStreak: number
  bestStreak: number
}
