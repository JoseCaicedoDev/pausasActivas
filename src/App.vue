<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDisclaimer } from '@/composables/useDisclaimer'
import { useNotification } from '@/composables/useNotification'
import { useAuthStore } from '@/stores/authStore'
import AppHeader from '@/components/layout/AppHeader.vue'
import NavigationBar from '@/components/layout/NavigationBar.vue'
import BreakModal from '@/components/break/BreakModal.vue'
import DisclaimerModal from '@/components/common/DisclaimerModal.vue'
import NotificationBanner from '@/components/common/NotificationBanner.vue'

const route = useRoute()
const auth = useAuthStore()
const { isAccepted, accept } = useDisclaimer()
const { requestPermission } = useNotification()
const isAuthRoute = computed(() => Boolean(route.meta.publicOnly))

async function onDisclaimerAccepted() {
  await accept()
  await requestPermission()
}
</script>

<template>
  <div v-if="auth.isBootstrapping" class="min-h-screen flex items-center justify-center">
    <p class="text-pa-text-muted text-sm">Cargando sesion...</p>
  </div>

  <RouterView v-else-if="!auth.isAuthenticated || isAuthRoute" />

  <DisclaimerModal v-else-if="!isAccepted" @accepted="onDisclaimerAccepted" />

  <div v-else class="min-h-screen pb-16">
    <AppHeader />
    <main class="max-w-2xl mx-auto px-4 py-6">
      <RouterView />
    </main>
    <NavigationBar />
  </div>

  <BreakModal v-if="auth.isAuthenticated" />
  <NotificationBanner v-if="auth.isAuthenticated" />
</template>
