'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChatBox } from '@/components/shared/ChatBox'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { rentalRequestsApi } from '@/lib/api/rental-requests'
import type { RequestDetailDto } from '@/types/rental-request'

const CHAT_ACTIVE_STATUSES = ['Pending', 'Accepted']
const PAYMENT_ALLOWED_STATUSES = ['Accepted']

export default function TenantRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const [detail, setDetail] = useState<RequestDetailDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    rentalRequestsApi.getRequestDetail(requestId)
      .then(setDetail)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [requestId])

  if (isLoading) return <LoadingSpinner className="py-16" />
  if (error) return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ErrorMessage message={error} />
    </div>
  )
  if (!detail) return null

  const isChatActive = CHAT_ACTIVE_STATUSES.includes(detail.status)
  const isPaymentAllowed = PAYMENT_ALLOWED_STATUSES.includes(detail.status)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <Link href="/tenant/requests" className="text-sm text-teal-600 hover:underline">
        &larr; Back to My Requests
      </Link>

      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6 space-y-3">
        <h1 className="text-xl font-bold text-stone-900">{detail.listingTitle}</h1>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-stone-600">
          <span><span className="font-medium text-stone-700">Status:</span> {detail.status}</span>
          <span><span className="font-medium text-stone-700">Move-in:</span> {detail.moveInDate}</span>
          <span><span className="font-medium text-stone-700">Duration:</span> {detail.expectedRentalDuration} months</span>
          <span><span className="font-medium text-stone-700">Occupants:</span> {detail.occupantCount}</span>
          <span><span className="font-medium text-stone-700">Share:</span> {detail.isRoommateWanted ? 'Yes' : 'No'}</span>
          <span><span className="font-medium text-stone-700">Contact:</span> {detail.contactPhone}</span>
          <span><span className="font-medium text-stone-700">Method:</span> {detail.preferredContactMethod}</span>
        </div>
        {detail.specialNotes && (
          <p className="text-sm text-stone-600">
            <span className="font-medium text-stone-700">Notes:</span> {detail.specialNotes}
          </p>
        )}
        <p className="text-xs text-stone-400">
          Submitted: {new Date(detail.submittedAt).toLocaleDateString()}
          {detail.decidedAt && ` · Decided: ${new Date(detail.decidedAt).toLocaleDateString()}`}
        </p>
      </div>

      {isPaymentAllowed && (
        <Link
          href={`/tenant/payment/${requestId}`}
          className="block w-full rounded-xl bg-teal-600 px-4 py-3 text-center font-semibold text-white hover:bg-teal-700 transition-colors"
        >
          Proceed to Payment
        </Link>
      )}

      {isChatActive && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-stone-800">Chat with Owner</h2>
          <ChatBox requestId={requestId} otherPartyName={detail.ownerName ?? 'Owner'} />
        </section>
      )}
    </div>
  )
}
