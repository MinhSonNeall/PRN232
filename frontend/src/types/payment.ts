export interface PaymentLinkResponseDto {
  paymentId: string
  checkoutUrl: string
  amount: number
  status: string
}

export interface PaymentStatusResponseDto {
  paymentId: string
  requestId: string
  amount: number
  status: 'Pending' | 'Paid' | 'Cancelled' | 'Failed'
  paidAt?: string
  paymentMethod?: string
}