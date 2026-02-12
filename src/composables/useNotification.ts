import { ref } from 'vue'

export function useNotification() {
  const permissionGranted = ref(Notification.permission === 'granted')

  async function requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') {
      permissionGranted.value = true
      return true
    }
    if (Notification.permission === 'denied') return false

    const result = await Notification.requestPermission()
    permissionGranted.value = result === 'granted'
    return permissionGranted.value
  }

  function showNotification(title: string, body: string): void {
    if (!permissionGranted.value) return

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: { title, body },
      })
    } else {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'pausas-activas',
      })
    }
  }

  function scheduleBreakNotification(delayMs: number): void {
    if (!permissionGranted.value) return

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_BREAK_NOTIFICATION',
        payload: {
          delayMs,
          title: 'Pausas Activas',
          body: 'Es hora de tu pausa activa. Cuida tu salud.',
        },
      })
    } else {
      setTimeout(() => {
        showNotification('Pausas Activas', 'Es hora de tu pausa activa. Cuida tu salud.')
      }, delayMs)
    }
  }

  return { permissionGranted, requestPermission, showNotification, scheduleBreakNotification }
}
