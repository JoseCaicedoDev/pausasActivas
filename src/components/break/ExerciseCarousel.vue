<script setup lang="ts">
import { useExerciseStore } from '@/stores/exerciseStore'
import ExerciseCard from './ExerciseCard.vue'

const exerciseStore = useExerciseStore()
</script>

<template>
  <div class="w-full">
    <!-- Exercise counter -->
    <div class="flex items-center justify-center gap-2 mb-6">
      <span
        v-for="(_, i) in exerciseStore.currentBreakExercises"
        :key="i"
        :class="[
          'w-2.5 h-2.5 rounded-full transition-all duration-300',
          i === exerciseStore.currentExerciseIndex
            ? 'bg-pa-accent scale-125'
            : i < exerciseStore.currentExerciseIndex
              ? 'bg-pa-accent/40'
              : 'bg-pa-surface-hover'
        ]"
      />
    </div>

    <!-- Current exercise -->
    <Transition
      mode="out-in"
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-8"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 -translate-x-8"
    >
      <ExerciseCard
        v-if="exerciseStore.currentExercise"
        :key="exerciseStore.currentExercise.id"
        :exercise="exerciseStore.currentExercise"
      />
    </Transition>

    <!-- Exercise number label -->
    <p class="text-center text-xs text-pa-text-muted mt-4">
      Ejercicio {{ exerciseStore.currentExerciseIndex + 1 }} de {{ exerciseStore.totalExercisesInBreak }}
    </p>
  </div>
</template>
