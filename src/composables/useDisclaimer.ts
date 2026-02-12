import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { alarmSound } from '@/services/audioService'

export function useDisclaimer() {
  const settingsStore = useSettingsStore()

  const isAccepted = computed(() => settingsStore.disclaimerAccepted)

  async function accept(): Promise<void> {
    settingsStore.acceptDisclaimer()
    await alarmSound.resume()
  }

  return { isAccepted, accept }
}
