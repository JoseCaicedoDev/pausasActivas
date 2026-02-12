import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Panel Principal' },
  },
  {
    path: '/historial',
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: { title: 'Historial de Cumplimiento' },
  },
  {
    path: '/ajustes',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: 'Ajustes' },
  },
  {
    path: '/acerca-de',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: 'Acerca de' },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const title = (to.meta.title as string) || 'Pausas Activas'
  document.title = `${title} - Pausas Activas`
})
