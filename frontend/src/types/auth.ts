export interface RegistrationDto {
  fullName: string
  email: string
  phone: string
  password: string
  role: 'Tenant' | 'Owner'
}

export interface SignInRequestDto {
  email: string
  password: string
}

export interface SignInResponseDto {
  token: string
  userId: string
  role: string
  fullName: string
  expiresAt: string
  requiresVerification?: boolean
}

export interface AuthUser {
  userId: string
  fullName: string
  email: string
  role: 'Tenant' | 'Owner' | 'SystemAdmin'
  token: string
}
