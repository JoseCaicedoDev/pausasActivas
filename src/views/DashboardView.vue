<script setup lang="ts">
import { onMounted } from 'vue'
import { useTimerStore } from '@/stores/timerStore'
import { useHistoryStore } from '@/stores/historyStore'
import WorkTimerDisplay from '@/components/timer/WorkTimerDisplay.vue'
import TimerControls from '@/components/timer/TimerControls.vue'
import ComplianceSummary from '@/components/history/ComplianceSummary.vue'

const timer = useTimerStore()
const history = useHistoryStore()

onMounted(() => {
  timer.restoreState()
  history.loadToday()
})
</script>

<template>
  <div class="flex flex-col items-center gap-8 py-4">
    <!-- Main Timer -->
    <WorkTimerDisplay />

    <!-- Controls -->
    <TimerControls />

    <!-- Today's compliance -->
    <div class="w-full max-w-md">
      <ComplianceSummary />
    </div>

    <!-- Info card -->
    <div class="w-full max-w-md card text-center">
      <p class="text-sm text-pa-text-muted">
        Las pausas activas cada <strong class="text-pa-text">2 horas</strong> son obligatorias
        segun la <strong class="text-pa-accent">Resolucion 1843 de 2025</strong>.
      </p>
    </div>
  </div>
</template>
