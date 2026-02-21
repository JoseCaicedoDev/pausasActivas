<script setup lang="ts">
import { computed } from 'vue'
import type { DailyRecord } from '@/types/session'

const props = defineProps<{ records: DailyRecord[] }>()

const days = computed(() => {
  const result: { label: string; percent: number; completed: number; expected: number }[] = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayLabel = d.toLocaleDateString('es-CO', { weekday: 'narrow' })
    const record = props.records.find(r => r.date === dateStr)

    result.push({
      label: dayLabel,
      percent: record?.compliancePercent ?? 0,
      completed: record?.sessionsCompleted ?? 0,
      expected: record?.sessionsExpected ?? 4,
    })
  }
  return result
})

function barColor(percent: number): string {
  if (percent >= 75) return 'bg-pa-success'
  if (percent >= 50) return 'bg-pa-warning'
  if (percent > 0) return 'bg-pa-danger'
  return 'bg-pa-surface-hover'
}
</script>

<template>
  <div class="card">
    <h3 class="text-sm font-semibold text-pa-text-muted mb-4">Ultimos 7 dias</h3>
    <div class="sr-only">
      <h4>Resumen semanal accesible</h4>
      <ul>
        <li v-for="(day, i) in days" :key="`summary-${i}`">
          {{ day.label }}: {{ day.completed }} de {{ day.expected }} pausas ({{ day.percent }}%)
        </li>
      </ul>
    </div>
    <div class="flex items-end justify-between gap-2 h-32">
      <div
        v-for="(day, i) in days"
        :key="i"
        class="flex-1 flex flex-col items-center gap-1"
      >
        <span class="text-[10px] text-pa-text-muted">{{ day.completed }}/{{ day.expected }}</span>
        <div class="w-full bg-pa-surface rounded-t h-24 flex items-end overflow-hidden">
          <div
            :class="['w-full rounded-t transition-all duration-500', barColor(day.percent)]"
            :style="{ height: `${Math.max(4, day.percent)}%` }"
          />
        </div>
        <span class="text-xs text-pa-text-muted font-medium">{{ day.label }}</span>
      </div>
    </div>
  </div>
</template>
