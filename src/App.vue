<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AppHeader from '@/components/layout/AppHeader.vue'
import NavigationBar from '@/components/layout/NavigationBar.vue'
import BreakModal from '@/components/break/BreakModal.vue'
import NotificationBanner from '@/components/common/NotificationBanner.vue'

const route = useRoute()
const auth = useAuthStore()
const isAuthRoute = computed(() => Boolean(route.meta.publicOnly))
</script>

<template>
  <div v-if="auth.isBootstrapping" class="min-h-screen flex items-center justify-center">
    <p class="text-pa-text-muted text-sm">Cargando sesion...</p>
  </div>

  <RouterView v-else-if="!auth.isAuthenticated || isAuthRoute" />

  <div v-else class="min-h-screen pb-16">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-pa-accent focus:text-pa-bg focus:px-3 focus:py-2 focus:rounded-lg"
    >
      Saltar al contenido principal
    </a>
    <AppHeader />
    <main id="main-content" class="max-w-2xl mx-auto px-4 py-6" tabindex="-1">
      <RouterView />
    </main>
    <NavigationBar />
  </div>

  <BreakModal v-if="auth.isAuthenticated" />
  <NotificationBanner v-if="auth.isAuthenticated" />
</template>
