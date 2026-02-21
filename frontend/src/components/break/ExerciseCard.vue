<script setup lang="ts">
import { computed } from 'vue'
import type { Exercise } from '@/types/exercise'
import { CATEGORY_LABELS } from '@/types/exercise'

const props = defineProps<{ exercise: Exercise }>()

const categoryLabel = computed(() => CATEGORY_LABELS[props.exercise.category])

const categoryColor = computed(() => {
  const colors: Record<string, string> = {
    visual: 'text-sky-400 bg-sky-400/10 border-sky-400/30',
    cuello_hombros: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    manos_munecas: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    espalda: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  }
  return colors[props.exercise.category] || 'text-pa-accent bg-pa-accent/10 border-pa-accent/30'
})

const illustrationSvg = computed(() => {
  const svgs: Record<string, string> = {
    visual: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2" class="w-full h-full">
      <circle cx="60" cy="60" r="25" /><circle cx="60" cy="60" r="10" fill="currentColor" />
      <path d="M10 60 Q35 30 60 35 Q85 30 110 60 Q85 90 60 85 Q35 90 10 60Z" />
      <line x1="45" y1="45" x2="75" y2="75" stroke-dasharray="4 2" />
      <line x1="75" y1="45" x2="45" y2="75" stroke-dasharray="4 2" />
    </svg>`,
    cuello_hombros: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2" class="w-full h-full">
      <circle cx="60" cy="30" r="15" /><line x1="60" y1="45" x2="60" y2="85" />
      <line x1="60" y1="55" x2="35" y2="70" /><line x1="60" y1="55" x2="85" y2="70" />
      <line x1="60" y1="85" x2="40" y2="110" /><line x1="60" y1="85" x2="80" y2="110" />
      <path d="M45 25 Q60 10 75 25" stroke-dasharray="3 2" />
      <path d="M30 35 Q25 30 30 25" /><path d="M90 35 Q95 30 90 25" />
    </svg>`,
    manos_munecas: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2" class="w-full h-full">
      <path d="M40 90 L40 50 Q40 40 50 40 L70 40 Q80 40 80 50 L80 90" />
      <line x1="50" y1="40" x2="50" y2="20" /><line x1="57" y1="40" x2="57" y2="15" />
      <line x1="64" y1="40" x2="64" y2="15" /><line x1="71" y1="40" x2="71" y2="20" />
      <line x1="40" y1="60" x2="25" y2="55" />
      <ellipse cx="60" cy="90" rx="22" ry="8" />
    </svg>`,
    espalda: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2" class="w-full h-full">
      <circle cx="60" cy="25" r="12" />
      <path d="M60 37 Q55 55 50 70 Q48 80 55 85" />
      <path d="M55 85 L45 110" /><path d="M55 85 L70 110" />
      <line x1="55" y1="50" x2="30" y2="60" /><line x1="55" y1="50" x2="80" y2="45" />
      <path d="M25 70 L90 70 L90 95 L25 95 Z" stroke-dasharray="4 2" opacity="0.3" />
    </svg>`,
  }
  return svgs[props.exercise.category] || svgs.visual
})
</script>

<template>
  <div class="animate-slide-in">
    <div class="flex items-center justify-center mb-4">
      <span :class="['text-xs font-medium px-3 py-1 rounded-full border', categoryColor]">
        {{ categoryLabel }}
      </span>
    </div>

    <div class="flex justify-center mb-6">
      <div class="w-28 h-28 text-pa-accent opacity-80" v-html="illustrationSvg" />
    </div>

    <h3 class="text-xl font-bold text-center text-white mb-2">
      {{ exercise.name }}
    </h3>
    <p class="text-sm text-pa-text-muted text-center mb-6">
      {{ exercise.description }}
    </p>

    <div class="space-y-3 max-w-md mx-auto">
      <div
        v-for="(step, i) in exercise.steps"
        :key="i"
        class="flex gap-3 items-start"
      >
        <span class="flex-shrink-0 w-6 h-6 rounded-full bg-pa-accent/20 text-pa-accent text-xs font-bold flex items-center justify-center mt-0.5">
          {{ i + 1 }}
        </span>
        <div>
          <p class="text-sm text-pa-text leading-relaxed">{{ step.instruction }}</p>
          <p class="text-xs text-pa-text-muted mt-0.5">
            {{ step.durationSeconds }}s
            <span v-if="step.repetitions"> - {{ step.repetitions }} repeticiones</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
