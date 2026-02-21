export interface SeoRouteMeta {
  title?: string
  requiresAuth?: boolean
  publicOnly?: boolean
  seoTitle?: string
  seoDescription?: string
  seoRobots?: string
  canonicalPath?: string
}

const SITE_NAME = 'Pausas Activas'
const SITE_ORIGIN = 'https://pausas.gira360.com'
const SITE_BASE_PATH = ''

export const DEFAULT_SEO_TITLE = 'Pausas Activas | SST Colombia y Bienestar Laboral'
export const DEFAULT_SEO_DESCRIPTION =
  'Pausas activas laborales para reducir fatiga, mejorar bienestar y apoyar cumplimiento SST en Colombia.'

function buildCanonicalUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const joined = `${SITE_BASE_PATH}${normalizedPath === '/' ? '/' : normalizedPath}`
  return new URL(joined, SITE_ORIGIN).toString()
}

function setOrCreateMeta(attr: 'name' | 'property', key: string, content: string): void {
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

export function applyRouteSeo(meta: SeoRouteMeta, toPath: string): void {
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
