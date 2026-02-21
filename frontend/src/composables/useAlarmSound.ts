import { alarmSound } from '@/services/audioService'
import { useSettingsStore } from '@/stores/settingsStore'

export function useAlarmSound() {
  function playBreakAlarm(): void {
    const settings = useSettingsStore()
    alarmSound.playBreakAlarm(settings.settings.alarmVolume)
  }

  function playBreakComplete(): void {
    const settings = useSettingsStore()
    alarmSound.playBreakComplete(settings.settings.alarmVolume)
  }

  function playChime(): void {
    const settings = useSettingsStore()
    alarmSound.playGentleChime(settings.settings.alarmVolume)
  }

  async function initAudio(): Promise<void> {
    await alarmSound.resume()
  }

  return { playBreakAlarm, playBreakComplete, playChime, initAudio }
}
