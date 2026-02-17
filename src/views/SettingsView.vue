<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore'
import { useNotification } from '@/composables/useNotification'
import { useAlarmSound } from '@/composables/useAlarmSound'

const settings = useSettingsStore()
const { requestPermission } = useNotification()
const { playChime } = useAlarmSound()

async function toggleNotifications() {
  if (!settings.settings.notificationsEnabled) {
    const granted = await requestPermission()
    await settings.setNotificationsEnabled(granted)
  } else {
    await settings.setNotificationsEnabled(false)
  }
}

function testAlarm() {
  playChime()
}
</script>

<template>
  <div class="space-y-6 pb-4">
    <h2 class="text-xl font-bold text-white">Ajustes</h2>

    <!-- Work interval -->
    <div class="card space-y-3">
      <h3 class="font-semibold text-sm text-pa-text-muted uppercase tracking-wider">Temporizador</h3>

      <div class="flex items-center justify-between">
        <label for="work-interval" class="text-sm">Intervalo de trabajo (horas)</label>
        <select
          id="work-interval"
          :value="settings.settings.workIntervalMinutes"
          class="bg-pa-bg border border-pa-surface-hover rounded-lg px-3 py-1.5 text-sm text-pa-text"
          @change="settings.setWorkInterval(Number(($event.target as HTMLSelectElement).value))"
        >
          <option :value="60">1 h</option>
          <option :value="120">2 h (Recomendado)</option>
          <option :value="180">3 h</option>
          <option :value="240">4 h</option>
          <option :value="300">5 h</option>
        </select>
      </div>

      <div class="flex items-center justify-between">
        <label for="break-duration" class="text-sm">Duracion de pausa (minutos)</label>
        <select
          id="break-duration"
          :value="settings.settings.breakDurationMinutes"
          class="bg-pa-bg border border-pa-surface-hover rounded-lg px-3 py-1.5 text-sm text-pa-text"
          @change="settings.setBreakDuration(Number(($event.target as HTMLSelectElement).value))"
        >
          <option :value="5">5 min</option>
          <option :value="10">10 min (Recomendado)</option>
          <option :value="15">15 min</option>
        </select>
      </div>

      <div class="flex items-center justify-between">
        <label for="work-start-hour" class="text-sm">Hora de inicio</label>
        <select
          id="work-start-hour"
          :value="settings.settings.workStartHour"
          class="bg-pa-bg border border-pa-surface-hover rounded-lg px-3 py-1.5 text-sm text-pa-text"
          @change="settings.setWorkHours(Number(($event.target as HTMLSelectElement).value), settings.settings.workEndHour)"
        >
          <option v-for="h in 12" :key="h" :value="h + 5">{{ (h + 5).toString().padStart(2, '0') }}:00</option>
        </select>
      </div>

      <div class="flex items-center justify-between">
        <label for="work-end-hour" class="text-sm">Hora de fin</label>
        <select
          id="work-end-hour"
          :value="settings.settings.workEndHour"
          class="bg-pa-bg border border-pa-surface-hover rounded-lg px-3 py-1.5 text-sm text-pa-text"
          @change="settings.setWorkHours(settings.settings.workStartHour, Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="h in 12" :key="h" :value="h + 12">{{ (h + 12).toString().padStart(2, '0') }}:00</option>
        </select>
      </div>
    </div>

    <!-- Sound -->
    <div class="card space-y-3">
      <h3 class="font-semibold text-sm text-pa-text-muted uppercase tracking-wider">Sonido</h3>

      <div class="flex items-center justify-between">
        <label for="alarm-volume" class="text-sm">Volumen de alarma</label>
        <div class="flex items-center gap-3">
          <input
            id="alarm-volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            :value="settings.settings.alarmVolume"
            class="w-24 accent-pa-accent"
            @input="settings.setAlarmVolume(Number(($event.target as HTMLInputElement).value))"
          />
          <span class="text-xs text-pa-text-muted w-8">{{ Math.round(settings.settings.alarmVolume * 100) }}%</span>
        </div>
      </div>

      <button class="text-sm text-pa-accent hover:underline" @click="testAlarm">
        Probar sonido
      </button>
    </div>

    <!-- Theme -->
    <div class="card space-y-3">
      <h3 class="font-semibold text-sm text-pa-text-muted uppercase tracking-wider">Apariencia</h3>

      <div class="flex gap-3">
        <button
          :class="[
            'flex-1 py-3 rounded-xl text-sm font-medium transition-colors border',
            settings.settings.theme === 'dark'
              ? 'bg-pa-accent text-pa-bg border-pa-accent'
              : 'bg-pa-surface text-pa-text border-pa-surface-hover hover:border-pa-accent/50'
          ]"
          @click="settings.setTheme('dark')"
        >
          Oscuro
        </button>
        <button
          :class="[
            'flex-1 py-3 rounded-xl text-sm font-medium transition-colors border',
            settings.settings.theme === 'pastel'
              ? 'bg-pa-accent text-pa-bg border-pa-accent'
              : 'bg-pa-surface text-pa-text border-pa-surface-hover hover:border-pa-accent/50'
          ]"
          @click="settings.setTheme('pastel')"
        >
          Pastel
        </button>
      </div>
    </div>

    <!-- Notifications -->
    <div class="card space-y-3">
      <h3 class="font-semibold text-sm text-pa-text-muted uppercase tracking-wider">Notificaciones</h3>

      <div class="flex items-center justify-between gap-3">
        <label id="notifications-push-label" class="text-sm">Notificaciones push</label>
        <button
          type="button"
          role="switch"
          :aria-checked="settings.settings.notificationsEnabled"
          aria-labelledby="notifications-push-label"
          :class="[
            'relative w-12 h-6 rounded-full transition-colors shrink-0',
            settings.settings.notificationsEnabled ? 'bg-pa-accent' : 'bg-pa-surface-hover'
          ]"
          @click="toggleNotifications"
        >
          <span
            :class="[
              'absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow',
              settings.settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
            ]"
          />
        </button>
      </div>
    </div>

    <!-- Auto restart -->
    <div class="card space-y-3">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <label id="auto-start-label" class="text-sm font-medium">Auto-reiniciar ciclo</label>
          <p class="text-xs text-pa-text-muted">Iniciar siguiente ciclo de trabajo automaticamente</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="settings.settings.autoStartNextCycle"
          aria-labelledby="auto-start-label"
          :class="[
            'relative w-12 h-6 rounded-full transition-colors shrink-0',
            settings.settings.autoStartNextCycle ? 'bg-pa-accent' : 'bg-pa-surface-hover'
          ]"
          @click="settings.setAutoStartNextCycle(!settings.settings.autoStartNextCycle)"
        >
          <span
            :class="[
              'absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow',
              settings.settings.autoStartNextCycle ? 'translate-x-6' : 'translate-x-0.5'
            ]"
          />
        </button>
      </div>
    </div>
  </div>
</template>
