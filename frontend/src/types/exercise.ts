export type ExerciseCategory = 'visual' | 'cuello_hombros' | 'manos_munecas' | 'espalda'

export interface ExerciseStep {
  instruction: string
  durationSeconds: number
  repetitions?: number
}

export interface Exercise {
  id: string
  category: ExerciseCategory
  name: string
  description: string
  benefits: string
  steps: ExerciseStep[]
  totalDurationSeconds: number
  illustration: string
  difficulty: 'facil' | 'moderado'
}

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  visual: 'Salud Visual',
  cuello_hombros: 'Cuello y Hombros',
  manos_munecas: 'Manos y Muñecas',
  espalda: 'Espalda',
}

export const CATEGORY_ICONS: Record<ExerciseCategory, string> = {
  visual: '👁',
  cuello_hombros: '🧘',
  manos_munecas: '🤲',
  espalda: '🔄',
}
