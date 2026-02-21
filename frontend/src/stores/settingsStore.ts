import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AlarmType, AppSettings, ThemeMode } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'
import { apiRequest } from '@/services/apiClient'
import type { RawSettingsResponse } from '@/services/contracts/settings'
import { mapSettingsResponse } from '@/services/mappers/settingsMapper'
import type { AppError } from '@/types/errors'
import { toAppError } from '@/types/errors'

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

function applyTheme(mode: ThemeMode): void {
  if (mode === 'pastel') {
    document.body.classList.add('pastel')
    document.body.classList.remove('dark')
    return
  }

  document.body.classList.add('dark')
  document.body.classList.remove('pastel')
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })
  const isLoaded = ref(false)
  const lastError = ref<AppError | null>(null)

  const theme = computed(() => settings.value.theme)
  const disclaimerAccepted = computed(() => settings.value.disclaimerAccepted)
  const expectedBreaksPerDay = computed(() => {
    const hours = settings.value.workEndHour - settings.value.workStartHour
    const interval = settings.value.workIntervalMinutes / 60
    return Math.floor(hours / interval)
  })

  async function loadSettings(): Promise<void> {
    try {
      const remote = await apiRequest<RawSettingsResponse>('/settings/me', { method: 'GET' })
      settings.value = mapSettingsResponse(remote)
      settings.value.workIntervalMinutes = normalizeWorkInterval(settings.value.workIntervalMinutes)
      lastError.value = null
    } catch (error) {
      settings.value = { ...DEFAULT_SETTINGS }
      settings.value.workIntervalMinutes = normalizeWorkInterval(settings.value.workIntervalMinutes)
      lastError.value = toAppError('settings', error, 'No fue posible cargar la configuracion', 'settings_load_failed')
    } finally {
      applyTheme(settings.value.theme)
      isLoaded.value = true
    }
  }

  async function persistSettings(): Promise<void> {
    if (!isLoaded.value) return

    try {
      await apiRequest('/settings/me', {
        method: 'PUT',
        body: JSON.stringify(settings.value),
      })
      lastError.value = null
    } catch (error) {
      lastError.value = toAppError('settings', error, 'No fue posible guardar la configuracion', 'settings_save_failed')
      throw error
    }
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

  function resetLocalState(): void {
    settings.value = { ...DEFAULT_SETTINGS }
    isLoaded.value = false
    lastError.value = null
    applyTheme(settings.value.theme)
  }

  applyTheme(settings.value.theme)

  return {
    settings,
    theme,
    isLoaded,
    lastError,
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
