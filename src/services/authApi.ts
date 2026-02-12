import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'
import { apiRequest } from './apiClient'

interface RawAuthUser {
  id: string
  email: string
  email_verified: boolean
  is_active: boolean
  created_at: string
}

interface RawAuthResponse {
  access_token: string
  user: RawAuthUser
}

function mapUser(raw: RawAuthUser): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    emailVerified: raw.email_verified,
    isActive: raw.is_active,
    createdAt: raw.created_at,
  }
}

function mapAuth(raw: RawAuthResponse): AuthResponse {
  return {
    accessToken: raw.access_token,
    user: mapUser(raw.user),
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiRequest<RawAuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false)
  return mapAuth(response)
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiRequest<RawAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false)
  return mapAuth(response)
}

export async function logout(): Promise<void> {
  await apiRequest<void>('/auth/logout', { method: 'POST' })
}

export async function refresh(): Promise<AuthResponse> {
  const response = await apiRequest<RawAuthResponse>('/auth/refresh', { method: 'POST' }, false)
  return mapAuth(response)
}

export async function me(): Promise<AuthUser> {
  const response = await apiRequest<RawAuthUser>('/auth/me', { method: 'GET' })
  return mapUser(response)
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
