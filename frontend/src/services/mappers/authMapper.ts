import type { AuthResponse, AuthUser } from '@/types/auth'
import type { RawAuthResponse, RawAuthUser } from '@/services/contracts/auth'

export function mapAuthUser(raw: RawAuthUser): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    emailVerified: raw.email_verified,
    isActive: raw.is_active,
    createdAt: raw.created_at,
  }
}

export function mapAuthResponse(raw: RawAuthResponse): AuthResponse {
  return {
    accessToken: raw.access_token,
    user: mapAuthUser(raw.user),
  }
}
