import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { applyRouteSeo, DEFAULT_SEO_DESCRIPTION, DEFAULT_SEO_TITLE, type SeoRouteMeta } from '@/services/seoService'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/PublicLandingView.vue'),
    meta: {
      title: 'Inicio',
      seoTitle: DEFAULT_SEO_TITLE,
      seoDescription: DEFAULT_SEO_DESCRIPTION,
      seoRobots: 'index, follow',
      canonicalPath: '/',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: 'Iniciar Sesion',
      publicOnly: true,
      seoTitle: 'Iniciar Sesion | Pausas Activas',
      seoDescription: 'Accede a Pausas Activas para gestionar tus pausas laborales y tu historial de cumplimiento.',
      seoRobots: 'noindex, nofollow',
      canonicalPath: '/login',
    },
  },
  {
    path: '/registro',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: {
      title: 'Crear Cuenta',
      publicOnly: true,
      seoTitle: 'Crear Cuenta | Pausas Activas',
      seoDescription: 'Crea tu cuenta de Pausas Activas para empezar a registrar tu bienestar y cumplimiento SST.',
      seoRobots: 'noindex, nofollow',
      canonicalPath: '/registro',
    },
  },
  {
    path: '/olvide-contrasena',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPasswordView.vue'),
    meta: {
      title: 'Olvide mi Contrasena',
      publicOnly: true,
      seoTitle: 'Recuperar Contrasena | Pausas Activas',
      seoDescription: 'Recupera el acceso a tu cuenta de Pausas Activas.',
      seoRobots: 'noindex, nofollow',
      canonicalPath: '/olvide-contrasena',
    },
  },
  {
    path: '/restablecer-contrasena',
    name: 'reset-password',
    component: () => import('@/views/auth/ResetPasswordView.vue'),
    meta: {
      title: 'Restablecer Contrasena',
      publicOnly: true,
      seoTitle: 'Restablecer Contrasena | Pausas Activas',
      seoDescription: 'Define una nueva contrasena para tu cuenta de Pausas Activas.',
      seoRobots: 'noindex, nofollow',
      canonicalPath: '/restablecer-contrasena',
    },
  },
  {
    path: '/panel',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      title: 'Panel Principal',
      requiresAuth: true,
      seoTitle: 'Panel Principal | Pausas Activas',
      seoDescription: 'Panel de seguimiento personal de pausas activas.',
      seoRobots: 'noindex, nofollow',
      canonicalPath: '/panel',
    },
  },
  {
    path: '/historial',
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: {
      title: 'Historial de Cumplimiento',
      requiresAuth: true,
      seoTitle: 'Historial de Cumplimiento | Pausas Activas',
      seoDescription: 'Historial de cumplimiento de pausas activas.',
      seoRobots: 'noindex, nofollow',
      canonicalPath: '/historial',
    },
  },
  {
    path: '/ajustes',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      title: 'Ajustes',
      requiresAuth: true,
      seoTitle: 'Ajustes | Pausas Activas',
      seoDescription: 'Configura recordatorios, frecuencia y perfil en Pausas Activas.',
      seoRobots: 'noindex, nofollow',
      canonicalPath: '/ajustes',
    },
  },
  {
    path: '/acerca-de',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      title: 'Acerca de',
      requiresAuth: true,
      seoTitle: 'Acerca de | Pausas Activas',
      seoDescription: 'Informacion general de Pausas Activas y su enfoque SST en Colombia.',
      seoRobots: 'noindex, nofollow',
      canonicalPath: '/acerca-de',
    },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

let bootstrapped = false

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const routeMeta = to.meta as SeoRouteMeta

  if (!bootstrapped) {
    await auth.bootstrap()
    bootstrapped = true
  }

  if (routeMeta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.name === 'landing' && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (routeMeta.publicOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  applyRouteSeo(routeMeta, to.path)
})
