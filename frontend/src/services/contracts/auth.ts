export interface RawAuthUser {
  id: string
  email: string
  email_verified: boolean
  is_active: boolean
  created_at: string
}

export interface RawAuthResponse {
  access_token: string
  user: RawAuthUser
}
