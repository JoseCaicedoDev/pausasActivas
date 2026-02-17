import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'
import { apiRequest } from './apiClient'
import type { RawAuthResponse, RawAuthUser } from '@/services/contracts/auth'
import { mapAuthResponse, mapAuthUser } from '@/services/mappers/authMapper'

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiRequest<RawAuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false)
  return mapAuthResponse(response)
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiRequest<RawAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false)
  return mapAuthResponse(response)
}

export async function logout(): Promise<void> {
  await apiRequest<void>('/auth/logout', { method: 'POST' })
}

export async function refresh(): Promise<AuthResponse> {
  const response = await apiRequest<RawAuthResponse>('/auth/refresh', { method: 'POST' }, false)
  return mapAuthResponse(response)
}

export async function me(): Promise<AuthUser> {
  const response = await apiRequest<RawAuthUser>('/auth/me', { method: 'GET' })
  return mapAuthUser(response)
}

export async function forgotPassword(email: string): Promise<void> {
  await apiRequest<void>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }, false)
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiRequest<void>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  }, false)
}
