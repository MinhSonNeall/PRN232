import { apiRequest } from '@/lib/api/api-client'
import type { UserAccountSummaryDto, UserAccountDetailDto, ChangeUserAccountStatusResponseDto, VerificationSummaryDto, VerificationDetailDto, AdminListingSummaryDto } from '@/types/admin'

export const adminApi = {
  getUserList: () => apiRequest<UserAccountSummaryDto[]>('/api/admin/users'),
  getUserDetail: (id: string) => apiRequest<UserAccountDetailDto>(`/api/admin/users/${id}`),
  suspendAccount: (id: string) => apiRequest<ChangeUserAccountStatusResponseDto>(`/api/admin/users/${id}/suspend`, { method: 'POST' }),
  enableAccount: (id: string) => apiRequest<ChangeUserAccountStatusResponseDto>(`/api/admin/users/${id}/enable`, { method: 'POST' }),
  disableAccount: (id: string) => apiRequest<ChangeUserAccountStatusResponseDto>(`/api/admin/users/${id}/disable`, { method: 'POST' }),
  getPendingVerifications: () => apiRequest<VerificationSummaryDto[]>('/api/admin/verification'),
  getVerificationDetail: (id: string) => apiRequest<VerificationDetailDto>(`/api/admin/verification/${id}`),
  approveVerification: (id: string, reviewNote?: string) => apiRequest<{ message: string }>(`/api/admin/verification/${id}/approve`, { method: 'POST', body: JSON.stringify({ reviewNote }) }),
  rejectVerification: (id: string, reviewNote: string) => apiRequest<{ message: string }>(`/api/admin/verification/${id}/reject`, { method: 'POST', body: JSON.stringify({ reviewNote }) }),
  getVisibleListings: () => apiRequest<AdminListingSummaryDto[]>('/api/admin/listings'),
  getListingDetails: (id: string) => apiRequest<AdminListingSummaryDto & { description?: string; ownerName: string; ownerEmail: string; images: string[] }>(`/api/admin/listings/${id}`),
  disableListing: (id: string) => apiRequest<{ listingId: string; newStatus: string; message: string }>(`/api/admin/listings/${id}/disable`, { method: 'POST' }),
}
