export interface LoginParams {
  email: string
  code: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}
