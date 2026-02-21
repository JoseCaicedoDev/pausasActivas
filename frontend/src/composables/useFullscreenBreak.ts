import { ref, onUnmounted } from 'vue'

export function useFullscreenBreak() {
  const isFullscreen = ref(false)
  const showReturnPrompt = ref(false)
  const breakActive = ref(false)

  function onFullscreenChange() {
    isFullscreen.value = !!document.fullscreenElement
    if (!document.fullscreenElement && breakActive.value) {
      showReturnPrompt.value = true
    }
  }

  function suppressKeyboard(e: KeyboardEvent) {
    if (!breakActive.value) return
    if (
      e.key === 'Escape' ||
      (e.altKey && e.key === 'F4') ||
      (e.ctrlKey && e.key === 'w') ||
      (e.ctrlKey && e.key === 'W') ||
      (e.ctrlKey && e.key === 'Tab')
    ) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  async function enterFullscreen(): Promise<void> {
    breakActive.value = true
    showReturnPrompt.value = false

    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('keydown', suppressKeyboard, { capture: true })

    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      isFullscreen.value = true
    } catch {
      // Fullscreen not available, CSS overlay is the fallback
      isFullscreen.value = false
    }

    // Keyboard Lock API (progressive enhancement)
    try {
      if ('keyboard' in navigator && 'lock' in (navigator.keyboard as Record<string, unknown>)) {
        await (navigator.keyboard as unknown as { lock: (keys: string[]) => Promise<void> }).lock(['Escape'])
      }
    } catch {
      // Not available or denied
    }
  }

  async function reEnterFullscreen(): Promise<void> {
    showReturnPrompt.value = false
    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      isFullscreen.value = true
    } catch {
      // Ignore
    }
  }

  async function exitFullscreen(): Promise<void> {
    breakActive.value = false
    showReturnPrompt.value = false

    document.removeEventListener('fullscreenchange', onFullscreenChange)
    document.removeEventListener('keydown', suppressKeyboard, { capture: true })

    // Release keyboard lock
    try {
      if ('keyboard' in navigator && 'unlock' in (navigator.keyboard as Record<string, unknown>)) {
        (navigator.keyboard as unknown as { unlock: () => void }).unlock()
      }
    } catch {
      // Ignore
    }

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch {
        // Ignore
      }
    }
    isFullscreen.value = false
  }

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange)
    document.removeEventListener('keydown', suppressKeyboard, { capture: true })
  })

  return {
    isFullscreen,
    showReturnPrompt,
    breakActive,
    enterFullscreen,
    reEnterFullscreen,
    exitFullscreen,
  }
}
