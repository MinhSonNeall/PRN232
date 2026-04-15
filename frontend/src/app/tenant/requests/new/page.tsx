'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ListingSummaryCard } from './ListingSummaryCard'
import { RentalRequestForm } from './RentalRequestForm'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { rentalRequestsApi } from '@/lib/api/rental-requests'

function NewRequestContent() {
  const searchParams = useSearchParams()
  const listingId = searchParams.get('listingId') ?? ''
  const [listing, setListing] = useState<{ title: string; price: number; address: string } | null>(null)

  useEffect(() => {
    if (listingId) {
      rentalRequestsApi.getForm(listingId)
        .then(data => setListing(data.listing))
        .catch(() => {})
    }
  }, [listingId])

  if (!listingId) return <p className="text-red-600">Missing listing ID</p>

  return (
    <div className="space-y-6">
      {listing && <ListingSummaryCard listing={listing} />}
      <RentalRequestForm listingId={listingId} />
    </div>
  )
}

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Submit Rental Request</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <NewRequestContent />
      </Suspense>
    </div>
  )
}
