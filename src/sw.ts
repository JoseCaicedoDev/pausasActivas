/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

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
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
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
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
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
        self.clients.openWindow('/')
      }),
    )
  } else if (event.action === 'snooze') {
    setTimeout(() => {
      self.registration.showNotification('Pausas Activas - Recordatorio', {
        body: 'Tu pausa activa esta pendiente. Es hora de cuidar tu salud.',
        icon: '/icons/icon-192x192.png',
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
          self.clients.openWindow('/')
        }
      }),
    )
  }
})
