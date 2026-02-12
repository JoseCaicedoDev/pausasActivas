import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: 'Iniciar Sesion', publicOnly: true },
  },
  {
    path: '/registro',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { title: 'Crear Cuenta', publicOnly: true },
  },
  {
    path: '/olvide-contrasena',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPasswordView.vue'),
    meta: { title: 'Olvide mi Contrasena', publicOnly: true },
  },
  {
    path: '/restablecer-contrasena',
    name: 'reset-password',
    component: () => import('@/views/auth/ResetPasswordView.vue'),
    meta: { title: 'Restablecer Contrasena', publicOnly: true },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Panel Principal', requiresAuth: true },
  },
  {
    path: '/historial',
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: { title: 'Historial de Cumplimiento', requiresAuth: true },
  },
  {
    path: '/ajustes',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: 'Ajustes', requiresAuth: true },
  },
  {
    path: '/acerca-de',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: 'Acerca de', requiresAuth: true },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

let bootstrapped = false

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!bootstrapped) {
    await auth.bootstrap()
    bootstrapped = true
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.publicOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  const title = (to.meta.title as string) || 'Pausas Activas'
  document.title = `${title} - Pausas Activas`
})
