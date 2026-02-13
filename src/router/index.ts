import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const SITE_NAME = 'Pausas Activas'
const SITE_ORIGIN = 'https://josecaicedodev.github.io'
const SITE_BASE_PATH = '/pausasActivas'
const DEFAULT_SEO_TITLE = 'Pausas Activas | SST Colombia y Bienestar Laboral'
const DEFAULT_SEO_DESCRIPTION =
  'Pausas activas laborales para reducir fatiga, mejorar bienestar y apoyar cumplimiento SST en Colombia.'

type SeoMeta = {
  title?: string
  requiresAuth?: boolean
  publicOnly?: boolean
  seoTitle?: string
  seoDescription?: string
  seoRobots?: string
  canonicalPath?: string
}

function buildCanonicalUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const joined = `${SITE_BASE_PATH}${normalizedPath === '/' ? '/' : normalizedPath}`
  return new URL(joined, SITE_ORIGIN).toString()
}

function setOrCreateMeta(
  attr: 'name' | 'property',
  key: string,
  content: string,
): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function applyRouteSeo(meta: SeoMeta, toPath: string): void {
  const title = meta.seoTitle || DEFAULT_SEO_TITLE
  const description = meta.seoDescription || DEFAULT_SEO_DESCRIPTION
  const robots = meta.seoRobots || 'noindex, nofollow'
  const canonicalUrl = buildCanonicalUrl(meta.canonicalPath || toPath)

  document.title = title
  setCanonical(canonicalUrl)
  setOrCreateMeta('name', 'description', description)
  setOrCreateMeta('name', 'robots', robots)
  setOrCreateMeta('property', 'og:type', 'website')
  setOrCreateMeta('property', 'og:site_name', SITE_NAME)
  setOrCreateMeta('property', 'og:locale', 'es_CO')
  setOrCreateMeta('property', 'og:title', title)
  setOrCreateMeta('property', 'og:description', description)
  setOrCreateMeta('property', 'og:url', canonicalUrl)
  setOrCreateMeta('property', 'og:image', `${SITE_ORIGIN}${SITE_BASE_PATH}/icons/icon-512x512.png`)
  setOrCreateMeta('name', 'twitter:card', 'summary_large_image')
  setOrCreateMeta('name', 'twitter:title', title)
  setOrCreateMeta('name', 'twitter:description', description)
  setOrCreateMeta('name', 'twitter:image', `${SITE_ORIGIN}${SITE_BASE_PATH}/icons/icon-512x512.png`)
}

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
  const routeMeta = to.meta as SeoMeta

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
