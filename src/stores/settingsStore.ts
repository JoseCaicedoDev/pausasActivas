import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import type { AppSettings, ThemeMode, AlarmType } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'

const STORAGE_KEY = 'pausas-activas-settings'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })

  const theme = computed(() => settings.value.theme)
  const disclaimerAccepted = computed(() => settings.value.disclaimerAccepted)
  const expectedBreaksPerDay = computed(() => {
    const hours = settings.value.workEndHour - settings.value.workStartHour
    const interval = settings.value.workIntervalMinutes / 60
    return Math.floor(hours / interval)
  })

  function loadSettings(): void {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<AppSettings>
        settings.value = { ...DEFAULT_SETTINGS, ...parsed }
      } catch {
        settings.value = { ...DEFAULT_SETTINGS }
      }
    }
  }

  function acceptDisclaimer(): void {
    settings.value.disclaimerAccepted = true
    settings.value.disclaimerAcceptedAt = new Date().toISOString()
  }

  function setTheme(mode: ThemeMode): void {
    settings.value.theme = mode
  }

  function setAlarmVolume(volume: number): void {
    settings.value.alarmVolume = Math.max(0, Math.min(1, volume))
  }

  function setAlarmType(type: AlarmType): void {
    settings.value.alarmType = type
  }

  function setWorkInterval(minutes: number): void {
    settings.value.workIntervalMinutes = minutes
  }

  function setBreakDuration(minutes: number): void {
    settings.value.breakDurationMinutes = minutes
  }

  function setWorkHours(start: number, end: number): void {
    settings.value.workStartHour = start
    settings.value.workEndHour = end
  }

  function setNotificationsEnabled(enabled: boolean): void {
    settings.value.notificationsEnabled = enabled
  }

  watch(settings, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    applyTheme(val.theme)
  }, { deep: true })

  function applyTheme(mode: ThemeMode): void {
    if (mode === 'pastel') {
      document.body.classList.add('pastel')
      document.body.classList.remove('dark')
    } else {
      document.body.classList.add('dark')
      document.body.classList.remove('pastel')
    }
  }

  loadSettings()
  applyTheme(settings.value.theme)

  return {
    settings,
    theme,
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
  }
})
