'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { listingsApi } from '@/lib/api/listings'
import type { ListingResponseDto } from '@/types/listing'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
      <svg className="h-12 w-12 text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p className="text-base font-medium text-stone-500">No listings yet</p>
      <p className="mt-1 text-sm text-stone-400">Create your first listing to start renting out rooms</p>
    </div>
  )
}

export default function OwnerListingPage() {
  const [listings, setListings] = useState<ListingResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reopenTarget, setReopenTarget] = useState<ListingResponseDto | null>(null)
  const [reopening, setReopening] = useState(false)

  const loadListings = () => {
    setIsLoading(true)
    listingsApi.getOwnerListings().then(setListings).finally(() => setIsLoading(false))
  }

  useEffect(() => { loadListings() }, [])

  const handleReopen = async () => {
    if (!reopenTarget) return
    setReopening(true)
    try {
      await listingsApi.reopenByListing(reopenTarget.listingId)
      setReopenTarget(null)
      loadListings()
    } catch { /* ignore */ }
    setReopening(false)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Listings</h1>
          <p className="mt-0.5 text-sm text-stone-500">Manage your room listings and their visibility</p>
        </div>
        <Link href="/owner/listing/new"><Button size="sm">Add Listing</Button></Link>
      </div>
      {isLoading ? <LoadingSpinner className="py-12" text="Loading listings..." /> : (
        <div className="space-y-3">
          {listings.length === 0 ? (
            <EmptyState />
          ) : (
            listings.map(l => (
              <div
                key={l.listingId}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-stone-300"
              >
                <div className="flex items-center gap-3">
                  <Badge status={l.status} />
                  <span className="font-semibold text-stone-900">{l.title}</span>
                </div>
                <div className="flex gap-2">
                  {l.status === 'Draft' && (
                    <>
                      <Link href={`/owner/listing/${l.listingId}/edit`}>
                        <Button variant="secondary" size="sm">Edit</Button>
                      </Link>
                      <Link href={`/owner/listing/${l.listingId}/publish`}>
                        <Button size="sm">Publish</Button>
                      </Link>
                    </>
                  )}
                  {l.status === 'PublishedAvailable' && (
                    <>
                      <Link href={`/owner/listing/${l.listingId}/visibility`}>
                        <Button variant="secondary" size="sm">Hide</Button>
                      </Link>
                      <Link href={`/owner/requests/room/${l.listingId}`}>
                        <Button variant="ghost" size="sm">Requests</Button>
                      </Link>
                    </>
                  )}
                  {l.status === 'Hidden' && (
                    <Link href={`/owner/listing/${l.listingId}/visibility`}>
                      <Button size="sm">Show</Button>
                    </Link>
                  )}
                  {l.status === 'Locked' && (
                    <>
                      <Link href={`/owner/requests/room/${l.listingId}`}>
                        <Button variant="secondary" size="sm">Requests</Button>
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => setReopenTarget(l)}>Reopen</Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      <Modal isOpen={!!reopenTarget} title="Reopen listing?" onClose={() => setReopenTarget(null)}>
        <p className="text-sm text-stone-600">This will revoke the accepted request and reopen &quot;{reopenTarget?.title}&quot; for new tenants. The current tenant will be notified.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setReopenTarget(null)}>Cancel</Button>
          <Button variant="danger" size="sm" isLoading={reopening} onClick={handleReopen}>Reopen</Button>
        </div>
      </Modal>
    </div>
  )
}
