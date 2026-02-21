export interface SessionCreatePayload {
  date: string
  startedAt: string
  exerciseIds: string[]
  durationPlannedSeconds: number
}

export interface SessionCompletePayload {
  completedAt: string
  durationActualSeconds: number
}
