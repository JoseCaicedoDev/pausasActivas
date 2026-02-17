<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { name: 'dashboard', path: '/panel', icon: '⏱️', label: 'Inicio' },
  { name: 'history', path: '/historial', icon: '📊', label: 'Historial' },
  { name: 'settings', path: '/ajustes', icon: '⚙️', label: 'Ajustes' },
  { name: 'about', path: '/acerca-de', icon: 'ℹ️', label: 'Info' },
]

const currentRoute = computed(() => route.name)
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-pa-surface/95 backdrop-blur-sm border-t border-pa-surface-hover/30 z-40">
    <div class="max-w-2xl mx-auto flex">
      <router-link
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.path"
        :class="[
          'flex-1 flex flex-col items-center py-2 px-1 transition-colors',
          currentRoute === tab.name
            ? 'text-pa-accent'
            : 'text-pa-text-muted hover:text-pa-text'
        ]"
      >
        <span class="text-lg" aria-hidden="true">{{ tab.icon }}</span>
        <span class="text-[10px] mt-0.5 font-medium">{{ tab.label }}</span>
      </router-link>
    </div>
  </nav>
</template>
