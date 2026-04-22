import { apiRequest } from '@/lib/api/api-client'
import type { PaymentLinkResponseDto, PaymentStatusResponseDto } from '@/types/payment'

export const paymentApi = {
  createPaymentLink: (requestId: string, method?: string) =>
    apiRequest<PaymentLinkResponseDto>(`/api/payment/create-link/${requestId}${method ? `?method=${method}` : ''}`, { method: 'POST' }),

  getPaymentByRequest: (requestId: string) =>
    apiRequest<PaymentStatusResponseDto>(`/api/payment/by-request/${requestId}`),
}