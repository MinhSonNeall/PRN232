'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const orderCode = searchParams.get('orderCode')
  const amount = searchParams.get('amount')

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price) || 0)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mb-6 rounded-full bg-green-100 p-4 w-20 h-20 mx-auto flex items-center justify-center">
        <span className="text-4xl text-green-600">✓</span>
      </div>
      
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Payment Successful!</h1>
      <p className="text-stone-600 mb-6">Thank you for your payment</p>

      <div className="rounded-xl bg-stone-50 p-4 mb-6 text-left">
        <div className="flex justify-between py-2 border-b border-stone-200">
          <span className="text-stone-600">Order Code</span>
          <span className="font-medium">{orderCode || '-'}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-stone-600">Amount</span>
          <span className="font-medium">{amount ? formatPrice(amount) : '-'}</span>
        </div>
      </div>

      <Link
        href="/tenant/requests"
        className="inline-block rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700"
      >
        View My Requests
      </Link>
    </div>
  )
}