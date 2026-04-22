'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { paymentApi } from '@/lib/api/payment'
import { rentalRequestsApi } from '@/lib/api/rental-requests'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import type { PaymentStatusResponseDto } from '@/types/payment'
import type { RequestDetailDto } from '@/types/rental-request'

type PaymentMethod = 'vnpay' | 'payos' | 'momo'
type PaymentStep = 'method' | 'confirm' | 'processing' | 'success' | 'failed'

interface Step {
  id: PaymentStep
  label: string
}

const steps: Step[] = [
  { id: 'method', label: 'Method' },
  { id: 'confirm', label: 'Confirm' },
  { id: 'processing', label: 'Processing' },
]

const paymentMethods: { id: PaymentMethod; name: string; logo: string }[] = [
  { id: 'vnpay', name: 'VNPay', logo: '💳' },
  { id: 'payos', name: 'PayOS', logo: '💵' },
  { id: 'momo', name: 'MoMo', logo: '📱' },
]

export default function PaymentPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const [payment, setPayment] = useState<PaymentStatusResponseDto | null>(null)
  const [request, setRequest] = useState<RequestDetailDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<PaymentStep>('method')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('payos')

  useEffect(() => {
    rentalRequestsApi.getRequestDetail(requestId)
      .then(setRequest)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
    
    paymentApi.getPaymentByRequest(requestId)
      .then(setPayment)
      .catch(() => {})
  }, [requestId])

  useEffect(() => {
    if (payment) {
      if (payment.status === 'Paid') {
        setCurrentStep('success')
      } else if (payment.status === 'Failed') {
        setCurrentStep('failed')
      }
    }
  }, [payment])

  const handlePayment = async () => {
    setIsProcessing(true)
    setError(null)
    setCurrentStep('processing')
    try {
      const response = await paymentApi.createPaymentLink(requestId, selectedMethod)
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsProcessing(false)
      setCurrentStep('failed')
    }
  }

  const getStepIndex = (step: PaymentStep) => steps.findIndex(s => s.id === step)

  if (isLoading) return <LoadingSpinner className="py-16" />
  if (error && !request) return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ErrorMessage message={error} />
    </div>
  )

  if (!request) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const getStatusText = () => {
    if (!payment) return 'Pending'
    return payment.status === 'Paid' ? 'Paid' : 
           payment.status === 'Failed' ? 'Failed' : 
           payment.status === 'Cancelled' ? 'Cancelled' : 'Pending'
  }

  const isPaid = payment?.status === 'Paid'

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/tenant/requests" className="text-sm text-teal-600 hover:underline">
        &larr; Back to My Requests
      </Link>

      {!isPaid && (
        <div className="mt-6 flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm
                ${getStepIndex(currentStep) >= index 
                  ? 'bg-teal-600 border-teal-600 text-white' 
                  : 'bg-white border-stone-300 text-stone-400'}`}>
                {getStepIndex(step.id) < getStepIndex(currentStep) ? '✓' : index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ml-3
                ${getStepIndex(currentStep) >= index ? 'text-teal-600' : 'text-stone-400'}`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 
                  ${getStepIndex(currentStep) > index ? 'bg-teal-600' : 'bg-stone-200'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Payment</h1>
          <p className="text-teal-100 text-sm">
            {isPaid ? 'Payment completed' : 'Complete your rental payment'}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {request && (
            <div className="rounded-xl bg-stone-50 p-4">
              <h2 className="font-semibold text-stone-800">{request.listingTitle}</h2>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-stone-600">
                <span>Move-in:</span>
                <span className="text-stone-900">{request.moveInDate}</span>
                <span>Duration:</span>
                <span className="text-stone-900">{request.expectedRentalDuration} months</span>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-stone-200 p-4">
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Amount Due</span>
              <span className="text-2xl font-bold text-stone-900">
                {payment ? formatPrice(payment.amount) : '-'}
              </span>
            </div>
          </div>

          {currentStep === 'method' && !isPaid && (
            <div className="space-y-3">
              <h3 className="font-semibold text-stone-800">Select Payment Method</h3>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-center
                      ${selectedMethod === method.id 
                        ? 'border-teal-600 bg-teal-50' 
                        : 'border-stone-200 hover:border-teal-300'}`}
                  >
                    <div className="text-2xl mb-1">{method.logo}</div>
                    <div className="font-medium text-stone-800 text-sm">{method.name}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentStep('confirm')}
                className="w-full rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700 transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {currentStep === 'confirm' && !isPaid && (
            <div className="space-y-4">
              <div className="rounded-xl bg-stone-50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Payment Method</span>
                  <span className="font-medium text-stone-900">
                    {paymentMethods.find(m => m.id === selectedMethod)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Amount</span>
                  <span className="font-medium text-stone-900">
                    {payment ? formatPrice(payment.amount) : '-'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep('method')}
                  className="flex-1 rounded-xl border border-stone-300 px-4 py-3 font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1 rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Confirm & Pay'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'processing' && !isPaid && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-8 text-center">
              <LoadingSpinner className="mx-auto w-8 h-8" />
              <p className="mt-4 font-semibold text-blue-800">Processing Payment...</p>
              <p className="text-sm text-blue-600">Please do not close this window</p>
            </div>
          )}

          {isPaid && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-3xl text-green-600">✓</span>
              </div>
              <p className="mt-4 font-semibold text-green-800">Payment Completed</p>
              <p className="text-sm text-green-600">
                Paid on {payment?.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '-'}
              </p>
              {payment?.paymentMethod && (
                <p className="text-sm text-green-600 mt-1">
                  via {payment.paymentMethod}
                </p>
              )}
            </div>
          )}

          {currentStep === 'failed' && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-3xl text-red-600">✕</span>
              </div>
              <p className="mt-4 font-semibold text-red-800">Payment Failed</p>
              <p className="text-sm text-red-600 mb-4">{error || 'Please try again'}</p>
              <button
                onClick={() => setCurrentStep('method')}
                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          <p className="text-center text-xs text-stone-500">
            Secure payment • Powered by {selectedMethod.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  )
}