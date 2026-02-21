import { onMounted, onUnmounted } from 'vue'

export function useTimerVisibilitySync(onVisible: () => void): void {
  function handleVisibilityChange() {
    if (!document.hidden) {
      onVisible()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
}
