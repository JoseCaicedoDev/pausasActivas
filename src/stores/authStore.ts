import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'
import * as authApi from '@/services/authApi'
import { configureApiAuth } from '@/services/apiClient'
import { useSettingsStore } from './settingsStore'

const ACCESS_TOKEN_KEY = 'pausas-activas-access-token'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY))
  const isBootstrapping = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value && accessToken.value))

  function setSession(payload: AuthResponse): void {
    accessToken.value = payload.accessToken
    user.value = payload.user
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
  }

  function clearSession(): void {
    accessToken.value = null
    user.value = null
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }

  async function bootstrap(): Promise<void> {
    if (isBootstrapping.value) return
    isBootstrapping.value = true
    try {
      if (accessToken.value) {
        try {
          const me = await authApi.me()
          user.value = me
          await useSettingsStore().loadSettings()
          return
        } catch {
          // try refresh below
        }
      }
      const refreshed = await tryRefresh()
      if (refreshed) await useSettingsStore().loadSettings()
    } finally {
      isBootstrapping.value = false
    }
  }

  async function login(payload: LoginPayload): Promise<void> {
    const response = await authApi.login(payload)
    setSession(response)
    await useSettingsStore().loadSettings()
  }

  async function register(payload: RegisterPayload): Promise<void> {
    const response = await authApi.register(payload)
    setSession(response)
    await useSettingsStore().loadSettings()
  }

  async function tryRefresh(): Promise<boolean> {
    try {
      const response = await authApi.refresh()
      setSession(response)
      return true
    } catch {
      clearSession()
      return false
    }
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } finally {
      useSettingsStore().resetLocalState()
      clearSession()
      if (typeof window !== 'undefined') {
        window.location.href = `${import.meta.env.BASE_URL}login`
      }
    }
  }

  configureApiAuth({
    getAccessToken: () => accessToken.value,
    onRefresh: tryRefresh,
  })

  return {
    user,
    accessToken,
    isAuthenticated,
    isBootstrapping,
    bootstrap,
    login,
    register,
    logout,
    tryRefresh,
    clearSession,
  }
})
