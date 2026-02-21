<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'
import type { ComplianceStats } from '@/types/session'
import WeeklyChart from '@/components/history/WeeklyChart.vue'
import DailyHistoryCard from '@/components/history/DailyHistoryCard.vue'

const history = useHistoryStore()
const stats = ref<ComplianceStats | null>(null)

onMounted(async () => {
  await history.loadWeekly()
  stats.value = await history.getComplianceStats(30)
})
</script>

<template>
  <div class="space-y-6 pb-4">
    <h2 class="text-xl font-bold text-white">Historial de Cumplimiento</h2>

    <!-- Stats summary -->
    <div v-if="stats" class="grid grid-cols-2 gap-3">
      <div class="card text-center">
        <p class="text-2xl font-bold text-pa-accent">{{ stats.averageCompliance }}%</p>
        <p class="text-xs text-pa-text-muted">Promedio 30 dias</p>
      </div>
      <div class="card text-center">
        <p class="text-2xl font-bold text-pa-success">{{ stats.currentStreak }}</p>
        <p class="text-xs text-pa-text-muted">Racha actual (dias)</p>
      </div>
      <div class="card text-center">
        <p class="text-2xl font-bold text-pa-warning">{{ stats.bestStreak }}</p>
        <p class="text-xs text-pa-text-muted">Mejor racha</p>
      </div>
      <div class="card text-center">
        <p class="text-2xl font-bold text-white">{{ stats.totalDays }}</p>
        <p class="text-xs text-pa-text-muted">Dias registrados</p>
      </div>
    </div>

    <!-- Weekly chart -->
    <WeeklyChart :records="history.weeklyRecords" />

    <!-- Daily list -->
    <div class="card">
      <h3 class="text-sm font-semibold text-pa-text-muted mb-3">Detalle semanal</h3>
      <div v-if="history.weeklyRecords.length > 0">
        <DailyHistoryCard
          v-for="record in [...history.weeklyRecords].reverse()"
          :key="record.date"
          :record="record"
        />
      </div>
      <p v-else class="text-sm text-pa-text-muted text-center py-4">
        Aun no hay registros. Inicia tu primera jornada para comenzar a registrar.
      </p>
    </div>
  </div>
</template>
