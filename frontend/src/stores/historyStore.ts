import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { BreakSession, ComplianceStats, DailyRecord } from '@/types/session'
import { completeSessionById, createSession, getDailyRecords, getSessionsByDate } from '@/services/db'
import type { AppError } from '@/types/errors'
import { toAppError } from '@/types/errors'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]!
}

export const useHistoryStore = defineStore('history', () => {
  const todaySessions = ref<BreakSession[]>([])
  const weeklyRecords = ref<DailyRecord[]>([])
  const isLoading = ref(false)
  const lastError = ref<AppError | null>(null)

  const todayCompleted = computed(() => todaySessions.value.filter((session) => session.completed).length)
  const todayStarted = computed(() => todaySessions.value.length)
  const todayCompliancePercent = computed(() => {
    const expected = todayRecord.value.sessionsExpected
    return expected > 0 ? Math.round((todayCompleted.value / expected) * 100) : 0
  })
  const todayRecord = computed((): DailyRecord => ({
    date: todayStr(),
    sessionsExpected: 4,
    sessionsStarted: todayStarted.value,
    sessionsCompleted: todayCompleted.value,
    compliancePercent: todayCompliancePercent.value,
    sessions: todaySessions.value,
  }))

  async function loadToday(): Promise<void> {
    isLoading.value = true
    try {
      todaySessions.value = await getSessionsByDate(todayStr())
      lastError.value = null
    } catch (error) {
      lastError.value = toAppError('history', error, 'No fue posible cargar el historial del dia', 'history_load_today_failed')
    } finally {
      isLoading.value = false
    }
  }

  async function loadWeekly(): Promise<void> {
    isLoading.value = true
    try {
      const today = new Date()
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 6)
      const from = weekAgo.toISOString().split('T')[0]!
      const to = todayStr()
      weeklyRecords.value = await getDailyRecords(from, to)
      lastError.value = null
    } catch (error) {
      lastError.value = toAppError('history', error, 'No fue posible cargar el historial semanal', 'history_load_weekly_failed')
    } finally {
      isLoading.value = false
    }
  }

  async function startSession(exerciseIds: string[], plannedDuration: number): Promise<string> {
    try {
      const session = await createSession({
        date: todayStr(),
        startedAt: new Date().toISOString(),
        exerciseIds,
        durationPlannedSeconds: plannedDuration,
      })
      todaySessions.value = [...todaySessions.value, session]
      lastError.value = null
      return session.id
    } catch (error) {
      lastError.value = toAppError('history', error, 'No fue posible registrar el inicio de la pausa', 'history_start_session_failed')
      throw error
    }
  }

  async function completeSession(sessionId: string, actualDuration: number): Promise<void> {
    const session = todaySessions.value.find((item) => item.id === sessionId)
    if (!session) return

    try {
      const updated = await completeSessionById(sessionId, {
        completedAt: new Date().toISOString(),
        durationActualSeconds: actualDuration,
      })
      Object.assign(session, updated)
      todaySessions.value = [...todaySessions.value]
      lastError.value = null
    } catch (error) {
      lastError.value = toAppError('history', error, 'No fue posible completar la pausa', 'history_complete_session_failed')
      throw error
    }
  }

  async function getComplianceStats(days: number = 30): Promise<ComplianceStats> {
    try {
      const today = new Date()
      const from = new Date(today)
      from.setDate(from.getDate() - days + 1)
      const records = await getDailyRecords(from.toISOString().split('T')[0]!, todayStr())

      const totalDays = records.length
      const averageCompliance = totalDays > 0
        ? Math.round(records.reduce((sum, record) => sum + record.compliancePercent, 0) / totalDays)
        : 0

      let currentStreak = 0
      let bestStreak = 0
      let tempStreak = 0

      const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
      for (const record of sorted) {
        if (record.compliancePercent >= 75) {
          tempStreak++
          if (tempStreak > bestStreak) bestStreak = tempStreak
        } else {
          if (currentStreak === 0) currentStreak = tempStreak
          tempStreak = 0
        }
      }
      if (currentStreak === 0) currentStreak = tempStreak

      lastError.value = null
      return { totalDays, averageCompliance, currentStreak, bestStreak }
    } catch (error) {
      lastError.value = toAppError('history', error, 'No fue posible calcular estadisticas', 'history_stats_failed')
      return { totalDays: 0, averageCompliance: 0, currentStreak: 0, bestStreak: 0 }
    }
  }

  function clearState(): void {
    todaySessions.value = []
    weeklyRecords.value = []
    isLoading.value = false
    lastError.value = null
  }

  return {
    todaySessions,
    weeklyRecords,
    isLoading,
    lastError,
    todayCompleted,
    todayStarted,
    todayCompliancePercent,
    todayRecord,
    loadToday,
    loadWeekly,
    startSession,
    completeSession,
    getComplianceStats,
    clearState,
  }
})
