import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BreakSession, DailyRecord, ComplianceStats } from '@/types/session'
import { saveSession, getSessionsByDate, getDailyRecords } from '@/services/db'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]!
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useHistoryStore = defineStore('history', () => {
  const todaySessions = ref<BreakSession[]>([])
  const weeklyRecords = ref<DailyRecord[]>([])
  const isLoading = ref(false)

  const todayCompleted = computed(() =>
    todaySessions.value.filter(s => s.completed).length
  )
  const todayStarted = computed(() => todaySessions.value.length)
  const todayCompliancePercent = computed(() => {
    const expected = todayRecord.value?.sessionsExpected ?? 4
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
    } finally {
      isLoading.value = false
    }
  }

  async function startSession(exerciseIds: string[], plannedDuration: number): Promise<string> {
    const session: BreakSession = {
      id: generateId(),
      date: todayStr(),
      startedAt: new Date().toISOString(),
      completedAt: null,
      completed: false,
      exerciseIds,
      durationPlannedSeconds: plannedDuration,
      durationActualSeconds: 0,
    }
    await saveSession(session)
    todaySessions.value = [...todaySessions.value, session]
    return session.id
  }

  async function completeSession(sessionId: string, actualDuration: number): Promise<void> {
    const session = todaySessions.value.find(s => s.id === sessionId)
    if (session) {
      session.completed = true
      session.completedAt = new Date().toISOString()
      session.durationActualSeconds = actualDuration
      await saveSession(session)
      todaySessions.value = [...todaySessions.value]
    }
  }

  async function getComplianceStats(days: number = 30): Promise<ComplianceStats> {
    const today = new Date()
    const from = new Date(today)
    from.setDate(from.getDate() - days + 1)
    const records = await getDailyRecords(
      from.toISOString().split('T')[0]!,
      todayStr(),
    )

    const totalDays = records.length
    const avgCompliance = totalDays > 0
      ? Math.round(records.reduce((sum, r) => sum + r.compliancePercent, 0) / totalDays)
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

    return { totalDays, averageCompliance: avgCompliance, currentStreak, bestStreak }
  }

  return {
    todaySessions,
    weeklyRecords,
    isLoading,
    todayCompleted,
    todayStarted,
    todayCompliancePercent,
    todayRecord,
    loadToday,
    loadWeekly,
    startSession,
    completeSession,
    getComplianceStats,
  }
})
