import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppSettings, ThemeMode, AlarmType } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'
import { apiRequest } from '@/services/apiClient'

const WORK_INTERVAL_OPTIONS = [60, 120, 180, 240, 300] as const

function normalizeWorkInterval(minutes: number): number {
  if (!Number.isFinite(minutes)) return DEFAULT_SETTINGS.workIntervalMinutes

  let closest: number = WORK_INTERVAL_OPTIONS[0]
  let minDistance = Math.abs(minutes - closest)

  for (const option of WORK_INTERVAL_OPTIONS.slice(1)) {
    const distance = Math.abs(minutes - option)
    if (distance < minDistance || (distance === minDistance && option < closest)) {
      closest = option
      minDistance = distance
    }
  }

  return closest
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })

  const theme = computed(() => settings.value.theme)
  const disclaimerAccepted = computed(() => settings.value.disclaimerAccepted)
  const expectedBreaksPerDay = computed(() => {
    const hours = settings.value.workEndHour - settings.value.workStartHour
    const interval = settings.value.workIntervalMinutes / 60
    return Math.floor(hours / interval)
  })
  const isLoaded = ref(false)

  async function loadSettings(): Promise<void> {
    try {
      const remote = await apiRequest<Partial<AppSettings>>('/settings/me', { method: 'GET' })
      settings.value = { ...DEFAULT_SETTINGS, ...remote }
      settings.value.workIntervalMinutes = normalizeWorkInterval(settings.value.workIntervalMinutes)
    } catch {
      settings.value = { ...DEFAULT_SETTINGS }
      settings.value.workIntervalMinutes = normalizeWorkInterval(settings.value.workIntervalMinutes)
    } finally {
      applyTheme(settings.value.theme)
      isLoaded.value = true
    }
  }

  async function persistSettings(): Promise<void> {
    if (!isLoaded.value) return
    await apiRequest('/settings/me', {
      method: 'PUT',
      body: JSON.stringify(settings.value),
    })
  }

  async function acceptDisclaimer(): Promise<void> {
    settings.value.disclaimerAccepted = true
    settings.value.disclaimerAcceptedAt = new Date().toISOString()
    await persistSettings()
  }

  async function setTheme(mode: ThemeMode): Promise<void> {
    settings.value.theme = mode
    applyTheme(mode)
    await persistSettings()
  }

  async function setAlarmVolume(volume: number): Promise<void> {
    settings.value.alarmVolume = Math.max(0, Math.min(1, volume))
    await persistSettings()
  }

  async function setAlarmType(type: AlarmType): Promise<void> {
    settings.value.alarmType = type
    await persistSettings()
  }

  async function setWorkInterval(minutes: number): Promise<void> {
    settings.value.workIntervalMinutes = normalizeWorkInterval(minutes)
    await persistSettings()
  }

  async function setBreakDuration(minutes: number): Promise<void> {
    settings.value.breakDurationMinutes = minutes
    await persistSettings()
  }

  async function setWorkHours(start: number, end: number): Promise<void> {
    settings.value.workStartHour = start
    settings.value.workEndHour = end
    await persistSettings()
  }

  async function setNotificationsEnabled(enabled: boolean): Promise<void> {
    settings.value.notificationsEnabled = enabled
    await persistSettings()
  }

  async function setAutoStartNextCycle(enabled: boolean): Promise<void> {
    settings.value.autoStartNextCycle = enabled
    await persistSettings()
  }

  function applyTheme(mode: ThemeMode): void {
    if (mode === 'pastel') {
      document.body.classList.add('pastel')
      document.body.classList.remove('dark')
    } else {
      document.body.classList.add('dark')
      document.body.classList.remove('pastel')
    }
  }

  function resetLocalState(): void {
    settings.value = { ...DEFAULT_SETTINGS }
    isLoaded.value = false
    applyTheme(settings.value.theme)
  }

  applyTheme(settings.value.theme)

  return {
    settings,
    theme,
    isLoaded,
    disclaimerAccepted,
    expectedBreaksPerDay,
    loadSettings,
    acceptDisclaimer,
    setTheme,
    setAlarmVolume,
    setAlarmType,
    setWorkInterval,
    setBreakDuration,
    setWorkHours,
    setNotificationsEnabled,
    setAutoStartNextCycle,
    resetLocalState,
  }
})
