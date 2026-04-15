import { apiRequest } from '@/lib/api/api-client'
import type { RentalRequestDto, RentalRequestSummaryDto, RequestDetailDto, EligibilityResponseDto, SubmissionResponseDto } from '@/types/rental-request'

export const rentalRequestsApi = {
  getForm: (listingId: string) => apiRequest<{ listing: { title: string; price: number; address: string } }>(`/api/rental-request/form/${listingId}`),
  submitRequest: (data: RentalRequestDto) => apiRequest<SubmissionResponseDto>('/api/rental-request', { method: 'POST', body: JSON.stringify(data) }),
  getMyRequests: () => apiRequest<RentalRequestSummaryDto[]>('/api/rental-request/my'),
  getRequestDetail: (id: string) => apiRequest<RequestDetailDto>(`/api/rental-request/${id}/detail`),
  checkCancellationEligibility: (id: string) => apiRequest<EligibilityResponseDto>(`/api/rental-request/${id}/cancellation-check`),
  cancelRequest: (id: string) => apiRequest<{ requestId: string; newStatus: string; message: string }>(`/api/rental-request/${id}/cancel`, { method: 'POST' }),
  getRoomRequests: (roomId: string) => apiRequest<unknown>(`/api/rental-request/room/${roomId}`),
  getOwnerAllRequests: () => apiRequest<unknown>(`/api/rental-request/owner-all`),
  acceptRequest: (id: string) => apiRequest<{ requestId: string; newStatus: string; message: string }>(`/api/rental-request/${id}/accept`, { method: 'POST' }),
  rejectRequest: (id: string) => apiRequest<{ requestId: string; newStatus: string; message: string }>(`/api/rental-request/${id}/reject`, { method: 'POST' }),
}
