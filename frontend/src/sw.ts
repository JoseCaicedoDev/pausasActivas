/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

const baseUrl = import.meta.env.BASE_URL || '/'
const icon192 = `${baseUrl}icons/icon-192x192.png`
const icon72 = `${baseUrl}icons/icon-72x72.png`

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Scheduled notification timeouts
const scheduledNotifications = new Map<string, ReturnType<typeof setTimeout>>()

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {}

  if (type === 'SCHEDULE_BREAK_NOTIFICATION') {
    const { delayMs, title, body } = payload
    const existing = scheduledNotifications.get('break-reminder')
    if (existing) clearTimeout(existing)

    const timeoutId = setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: icon192,
        badge: icon72,
        tag: 'break-reminder',
        requireInteraction: true,
      } as NotificationOptions)
      scheduledNotifications.delete('break-reminder')
    }, delayMs)

    scheduledNotifications.set('break-reminder', timeoutId)
  }

  if (type === 'SHOW_NOTIFICATION') {
    const { title, body } = payload
    self.registration.showNotification(title, {
      body,
      icon: icon192,
      badge: icon72,
      tag: 'pausas-activas',
    })
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'start-break') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: 'START_BREAK' })
          ;(client as WindowClient).focus()
          return
        }
        self.clients.openWindow(baseUrl)
      }),
    )
  } else if (event.action === 'snooze') {
    setTimeout(() => {
      self.registration.showNotification('Pausas Activas - Recordatorio', {
        body: 'Tu pausa activa esta pendiente. Es hora de cuidar tu salud.',
        icon: icon192,
        tag: 'break-reminder',
        requireInteraction: true,
      })
    }, 5 * 60 * 1000)
  } else {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        const first = clients[0]
        if (first) {
          ;(first as WindowClient).focus()
        } else {
          self.clients.openWindow(baseUrl)
        }
      }),
    )
  }
})
