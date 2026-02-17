<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const showBanner = ref(false)
let deferredPrompt: BeforeInstallPromptEvent | null = null

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    showBanner.value = true
  })
})

async function install() {
  if (!deferredPrompt) return
  await deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  if (outcome === 'accepted') {
    showBanner.value = false
  }
  deferredPrompt = null
}

function dismiss() {
  showBanner.value = false
  deferredPrompt = null
}
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="translate-y-full"
    enter-to-class="translate-y-0"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-from-class="translate-y-0"
    leave-to-class="translate-y-full"
  >
    <div v-if="showBanner" class="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto">
      <div class="card flex items-center gap-4" role="status" aria-live="polite">
        <div class="text-3xl" aria-hidden="true">&#x1F4F2;</div>
        <div class="flex-1">
          <p class="font-medium text-sm">Instalar Pausas Activas</p>
          <p class="text-xs text-pa-text-muted">Acceso rapido desde el escritorio</p>
        </div>
        <div class="flex gap-2">
          <button class="text-xs text-pa-text-muted hover:text-pa-text" @click="dismiss">
            Ahora no
          </button>
          <button class="btn-primary text-xs !px-3 !py-1.5" @click="install">
            Instalar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
