<script setup lang="ts">
import { useDisclaimer } from '@/composables/useDisclaimer'
import { useNotification } from '@/composables/useNotification'
import AppHeader from '@/components/layout/AppHeader.vue'
import NavigationBar from '@/components/layout/NavigationBar.vue'
import BreakModal from '@/components/break/BreakModal.vue'
import DisclaimerModal from '@/components/common/DisclaimerModal.vue'
import NotificationBanner from '@/components/common/NotificationBanner.vue'

const { isAccepted, accept } = useDisclaimer()
const { requestPermission } = useNotification()

async function onDisclaimerAccepted() {
  await accept()
  await requestPermission()
}
</script>

<template>
  <!-- Disclaimer blocks everything on first use -->
  <DisclaimerModal v-if="!isAccepted" @accepted="onDisclaimerAccepted" />

  <!-- Main app -->
  <div v-else class="min-h-screen pb-16">
    <AppHeader />
    <main class="max-w-2xl mx-auto px-4 py-6">
      <RouterView />
    </main>
    <NavigationBar />
  </div>

  <!-- Break modal (always mounted, shows/hides via store state) -->
  <BreakModal />

  <!-- PWA install prompt -->
  <NotificationBanner />
</template>
