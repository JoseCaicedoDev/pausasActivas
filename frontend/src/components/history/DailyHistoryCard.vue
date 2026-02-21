<script setup lang="ts">
import { computed } from 'vue'
import type { DailyRecord } from '@/types/session'

const props = defineProps<{ record: DailyRecord }>()

const formattedDate = computed(() => {
  const d = new Date(props.record.date + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
})

const complianceColor = computed(() => {
  const pct = props.record.compliancePercent
  if (pct >= 75) return 'text-pa-success'
  if (pct >= 50) return 'text-pa-warning'
  return 'text-pa-danger'
})

const barWidth = computed(() => Math.min(100, props.record.compliancePercent))
const barColor = computed(() => {
  const pct = props.record.compliancePercent
  if (pct >= 75) return 'bg-pa-success'
  if (pct >= 50) return 'bg-pa-warning'
  return 'bg-pa-danger'
})
</script>

<template>
  <div class="flex items-center gap-4 py-3 border-b border-pa-surface-hover/30 last:border-0">
    <div class="w-20 text-sm text-pa-text-muted">{{ formattedDate }}</div>
    <div class="flex-1">
      <div class="h-2 bg-pa-surface rounded-full overflow-hidden">
        <div :class="['h-full rounded-full transition-all', barColor]" :style="{ width: `${barWidth}%` }" />
      </div>
    </div>
    <div class="text-right w-24">
      <span :class="['text-sm font-semibold', complianceColor]">
        {{ record.sessionsCompleted }}/{{ record.sessionsExpected }}
      </span>
      <span class="text-xs text-pa-text-muted ml-1">({{ record.compliancePercent }}%)</span>
    </div>
  </div>
</template>
