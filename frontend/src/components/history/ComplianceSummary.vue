<script setup lang="ts">
import { computed } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'
import { useSettingsStore } from '@/stores/settingsStore'
import CircularProgress from '@/components/common/CircularProgress.vue'

const history = useHistoryStore()
const settings = useSettingsStore()

const expected = computed(() => settings.expectedBreaksPerDay)
const complianceColor = computed(() => {
  const pct = history.todayCompliancePercent
  if (pct >= 75) return '#4ade80'
  if (pct >= 50) return '#fbbf24'
  return '#f87171'
})
</script>

<template>
  <div class="card">
    <div class="flex items-center gap-4">
      <CircularProgress
        :progress="history.todayCompliancePercent / 100"
        :size="72"
        :stroke-width="6"
        :color="complianceColor"
        label="Cumplimiento de pausas del dia"
      >
        <span class="text-xs font-bold">{{ history.todayCompliancePercent }}%</span>
      </CircularProgress>
      <div>
        <p class="font-semibold text-white">
          {{ history.todayCompleted }} de {{ expected }} pausas completadas
        </p>
        <p class="text-sm text-pa-text-muted">Hoy</p>
      </div>
    </div>
  </div>
</template>
