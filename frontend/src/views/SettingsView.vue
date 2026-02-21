<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useNotification } from '@/composables/useNotification'
import { useAlarmSound } from '@/composables/useAlarmSound'
import SettingRow from '@/components/settings/SettingRow.vue'
import SettingSelect from '@/components/settings/SettingSelect.vue'
import SettingToggle from '@/components/settings/SettingToggle.vue'

const settingsStore = useSettingsStore()
const { requestPermission } = useNotification()
const { playChime } = useAlarmSound()

const workIntervalOptions = [
  { value: 60, label: '1 h' },
  { value: 120, label: '2 h (Recomendado)' },
  { value: 180, label: '3 h' },
  { value: 240, label: '4 h' },
  { value: 300, label: '5 h' },
]

const breakDurationOptions = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min (Recomendado)' },
  { value: 15, label: '15 min' },
]

const startHourOptions = Array.from({ length: 12 }, (_, index) => {
  const value = index + 6
  return {
    value,
    label: `${value.toString().padStart(2, '0')}:00`,
  }
})

const endHourOptions = Array.from({ length: 12 }, (_, index) => {
  const value = index + 13
  return {
    value,
    label: `${value.toString().padStart(2, '0')}:00`,
  }
})

const settings = computed(() => settingsStore.settings)

async function toggleNotifications(enabled: boolean) {
  if (enabled) {
    const granted = await requestPermission()
    await settingsStore.setNotificationsEnabled(granted)
    return
  }

  await settingsStore.setNotificationsEnabled(false)
}

function testAlarm() {
  playChime()
}
</script>

<template>
  <div class="space-y-6 pb-4">
    <h2 class="text-xl font-bold text-white">Ajustes</h2>

    <div v-if="settingsStore.lastError" class="card border-pa-danger/40">
      <p class="text-sm text-pa-danger">{{ settingsStore.lastError.message }}</p>
    </div>

    <div class="card space-y-3">
      <h3 class="font-semibold text-sm text-pa-text-muted uppercase tracking-wider">Temporizador</h3>

      <SettingRow label="Intervalo de trabajo (horas)" label-id="work-interval-label">
        <SettingSelect
          id="work-interval"
          :model-value="settings.workIntervalMinutes"
          :options="workIntervalOptions"
          @update:model-value="settingsStore.setWorkInterval"
        />
      </SettingRow>

      <SettingRow label="Duracion de pausa (minutos)" label-id="break-duration-label">
        <SettingSelect
          id="break-duration"
          :model-value="settings.breakDurationMinutes"
          :options="breakDurationOptions"
          @update:model-value="settingsStore.setBreakDuration"
        />
      </SettingRow>

      <SettingRow label="Hora de inicio" label-id="work-start-hour-label">
        <SettingSelect
          id="work-start-hour"
          :model-value="settings.workStartHour"
          :options="startHourOptions"
          @update:model-value="(value) => settingsStore.setWorkHours(value, settings.workEndHour)"
        />
      </SettingRow>

      <SettingRow label="Hora de fin" label-id="work-end-hour-label">
        <SettingSelect
          id="work-end-hour"
          :model-value="settings.workEndHour"
          :options="endHourOptions"
          @update:model-value="(value) => settingsStore.setWorkHours(settings.workStartHour, value)"
        />
      </SettingRow>
    </div>

    <div class="card space-y-3">
      <h3 class="font-semibold text-sm text-pa-text-muted uppercase tracking-wider">Sonido</h3>

      <SettingRow label="Volumen de alarma" label-id="alarm-volume-label">
        <div class="flex items-center gap-3">
          <input
            id="alarm-volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            :value="settings.alarmVolume"
            class="w-24 accent-pa-accent"
            @input="settingsStore.setAlarmVolume(Number(($event.target as HTMLInputElement).value))"
          />
          <span class="text-xs text-pa-text-muted w-8">{{ Math.round(settings.alarmVolume * 100) }}%</span>
        </div>
      </SettingRow>

      <button class="text-sm text-pa-accent hover:underline" @click="testAlarm">
        Probar sonido
      </button>
    </div>

    <div class="card space-y-3">
      <h3 class="font-semibold text-sm text-pa-text-muted uppercase tracking-wider">Apariencia</h3>

      <div class="flex gap-3">
        <button
          :class="[
            'flex-1 py-3 rounded-xl text-sm font-medium transition-colors border',
            settings.theme === 'dark'
              ? 'bg-pa-accent text-pa-bg border-pa-accent'
              : 'bg-pa-surface text-pa-text border-pa-surface-hover hover:border-pa-accent/50'
          ]"
          @click="settingsStore.setTheme('dark')"
        >
          Oscuro
        </button>
        <button
          :class="[
            'flex-1 py-3 rounded-xl text-sm font-medium transition-colors border',
            settings.theme === 'pastel'
              ? 'bg-pa-accent text-pa-bg border-pa-accent'
              : 'bg-pa-surface text-pa-text border-pa-surface-hover hover:border-pa-accent/50'
          ]"
          @click="settingsStore.setTheme('pastel')"
        >
          Pastel
        </button>
      </div>
    </div>

    <div class="card space-y-3">
      <h3 class="font-semibold text-sm text-pa-text-muted uppercase tracking-wider">Notificaciones</h3>
      <SettingRow label="Notificaciones push" label-id="notifications-push-label">
        <SettingToggle
          :model-value="settings.notificationsEnabled"
          labelled-by="notifications-push-label"
          @update:model-value="toggleNotifications"
        />
      </SettingRow>
    </div>

    <div class="card space-y-3">
      <SettingRow
        label="Auto-reiniciar ciclo"
        hint="Iniciar siguiente ciclo de trabajo automaticamente"
        label-id="auto-start-label"
      >
        <SettingToggle
          :model-value="settings.autoStartNextCycle"
          labelled-by="auto-start-label"
          @update:model-value="settingsStore.setAutoStartNextCycle"
        />
      </SettingRow>
    </div>
  </div>
</template>
