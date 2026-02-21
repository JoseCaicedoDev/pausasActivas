import type { AppSettings } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'
import type { RawSettingsResponse } from '@/services/contracts/settings'

export function mapSettingsResponse(raw: RawSettingsResponse): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
  }
}
