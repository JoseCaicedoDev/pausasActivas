export type AppErrorSource = 'api' | 'timer' | 'settings' | 'auth' | 'history' | 'ui'

export interface AppError {
  code: string
  message: string
  recoverable: boolean
  source: AppErrorSource
}

export function toAppError(
  source: AppErrorSource,
  error: unknown,
  fallbackMessage: string,
  code: string = 'unknown_error',
): AppError {
  if (error instanceof Error) {
    return {
      code,
      message: error.message || fallbackMessage,
      recoverable: true,
      source,
    }
  }

  return {
    code,
    message: fallbackMessage,
    recoverable: true,
    source,
  }
}
