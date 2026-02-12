import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Exercise, ExerciseCategory } from '@/types/exercise'
import { exercises as allExercisesData } from '@/services/exerciseData'
import { useAuthStore } from './authStore'

const HISTORY_SIZE = 8
const CATEGORIES: ExerciseCategory[] = ['visual', 'cuello_hombros', 'manos_munecas', 'espalda']

function recentStorageKey(): string {
  const auth = useAuthStore()
  const userId = auth.user?.id ?? 'anonymous'
  return `pausas-activas:${userId}:recent-exercises`
}

export const useExerciseStore = defineStore('exercise', () => {
  const allExercises = ref<Exercise[]>(allExercisesData)
  const currentBreakExercises = ref<Exercise[]>([])
  const currentExerciseIndex = ref(0)
  const recentExerciseIds = ref<string[]>([])

  const currentExercise = computed(() =>
    currentBreakExercises.value[currentExerciseIndex.value] ?? null
  )
  const totalExercisesInBreak = computed(() => currentBreakExercises.value.length)
  const isLastExercise = computed(() =>
    currentExerciseIndex.value >= currentBreakExercises.value.length - 1
  )

  function loadRecent(): void {
    const saved = localStorage.getItem(recentStorageKey())
    if (saved) {
      try {
        recentExerciseIds.value = JSON.parse(saved)
      } catch {
        recentExerciseIds.value = []
      }
    }
  }

  function saveRecent(): void {
    localStorage.setItem(recentStorageKey(), JSON.stringify(recentExerciseIds.value))
  }

  function selectExercisesForBreak(count: number = 4): Exercise[] {
    const selected: Exercise[] = []

    for (const category of CATEGORIES) {
      if (selected.length >= count) break

      const candidates = allExercises.value.filter(
        ex => ex.category === category && !recentExerciseIds.value.includes(ex.id)
      )

      if (candidates.length === 0) {
        const allInCategory = allExercises.value.filter(ex => ex.category === category)
        const pick = allInCategory[Math.floor(Math.random() * allInCategory.length)]
        if (pick) selected.push(pick)
      } else {
        const pick = candidates[Math.floor(Math.random() * candidates.length)]
        if (pick) selected.push(pick)
      }
    }

    // Fisher-Yates shuffle
    for (let i = selected.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selected[i], selected[j]] = [selected[j]!, selected[i]!]
    }

    // Update recent history
    recentExerciseIds.value = [
      ...selected.map(ex => ex.id),
      ...recentExerciseIds.value,
    ].slice(0, HISTORY_SIZE)
    saveRecent()

    currentBreakExercises.value = selected
    currentExerciseIndex.value = 0

    return selected
  }

  function advanceExercise(): boolean {
    if (currentExerciseIndex.value < currentBreakExercises.value.length - 1) {
      currentExerciseIndex.value++
      return true
    }
    return false
  }

  function reset(): void {
    currentBreakExercises.value = []
    currentExerciseIndex.value = 0
  }

  loadRecent()

  return {
    allExercises,
    currentBreakExercises,
    currentExerciseIndex,
    currentExercise,
    totalExercisesInBreak,
    isLastExercise,
    selectExercisesForBreak,
    advanceExercise,
    reset,
  }
})
