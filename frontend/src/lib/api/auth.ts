import { apiRequest } from '@/lib/api/api-client'
import type { RegistrationDto, SignInRequestDto, SignInResponseDto } from '@/types/auth'

export interface RegistrationResponseDto {
  userId: string
  email: string
  role: string
  message: string
}

export interface RegistrationFormResponseDto {
  availableRoles: string[]
}

export const authApi = {
  getRegistrationForm: () => apiRequest<RegistrationFormResponseDto>('/api/auth/register'),
  registerAccount: (data: RegistrationDto) => apiRequest<RegistrationResponseDto>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  signIn: (data: SignInRequestDto) => apiRequest<SignInResponseDto>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  verifyCode: (data: { userId: string; code: string }) => apiRequest<SignInResponseDto>('/api/auth/verify-code', { method: 'POST', body: JSON.stringify(data) }),
  signOut: () => apiRequest<void>('/api/auth/logout', { method: 'POST' }),
  getCurrentUser: () => apiRequest<{ userId: string; fullName: string; email: string; role: string; accountStatus: string }>('/api/auth/me'),
}
