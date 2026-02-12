export type ThemeMode = 'dark' | 'pastel'
export type AlarmType = 'gentle' | 'chime' | 'bell'

export interface AppSettings {
  workIntervalMinutes: number
  breakDurationMinutes: number
  alarmVolume: number
  alarmType: AlarmType
  theme: ThemeMode
  disclaimerAccepted: boolean
  disclaimerAcceptedAt: string | null
  notificationsEnabled: boolean
  autoStartNextCycle: boolean
  workStartHour: number
  workEndHour: number
}

export const DEFAULT_SETTINGS: AppSettings = {
  workIntervalMinutes: 120,
  breakDurationMinutes: 10,
  alarmVolume: 0.5,
  alarmType: 'gentle',
  theme: 'dark',
  disclaimerAccepted: false,
  disclaimerAcceptedAt: null,
  notificationsEnabled: false,
  autoStartNextCycle: true,
  workStartHour: 8,
  workEndHour: 18,
}
