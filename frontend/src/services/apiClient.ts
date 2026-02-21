type RefreshHandler = () => Promise<boolean>
type TokenGetter = () => string | null

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
  || 'http://localhost:8000'

let getToken: TokenGetter = () => null
let refreshAccessToken: RefreshHandler = async () => false

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function configureApiAuth(options: { getAccessToken: TokenGetter, onRefresh: RefreshHandler }): void {
  getToken = options.getAccessToken
  refreshAccessToken = options.onRefresh
}

export function getApiBaseUrl(): string {
  return API_BASE_URL
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  authRequired: boolean = true,
): Promise<T> {
  const headers = new Headers(init.headers)
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData
  if (!isFormData && !headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (authRequired) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const runFetch = () => fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })

  let response = await runFetch()

  if (response.status === 401 && authRequired && path !== '/auth/refresh') {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      const token = getToken()
      if (token) headers.set('Authorization', `Bearer ${token}`)
      response = await runFetch()
    }
  }

  if (!response.ok) {
    let message = 'Error de solicitud'
    try {
      const data = await response.json() as { detail?: string }
      if (data.detail) message = data.detail
    } catch {
      // ignore parse error
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
