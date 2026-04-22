'use client'
import Link from 'next/link'

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-4 w-20 h-20 mx-auto flex items-center justify-center">
        <span className="text-4xl text-red-600">✕</span>
      </div>
      
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Payment Cancelled</h1>
      <p className="text-stone-600 mb-6">Your payment was cancelled. Please try again.</p>

      <Link
        href="/tenant/requests"
        className="inline-block rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700"
      >
        Back to My Requests
      </Link>
    </div>
  )
}