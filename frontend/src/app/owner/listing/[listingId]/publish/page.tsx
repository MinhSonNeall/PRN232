'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { listingsApi } from '@/lib/api/listings'
import type { PublicationEligibilityDto } from '@/types/listing'

export default function PublishListingPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const router = useRouter()
  const [eligibility, setEligibility] = useState<PublicationEligibilityDto | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listingsApi.getPublishCheck(listingId).then(setEligibility)
  }, [listingId])

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await listingsApi.publishListing(listingId)
      router.push('/owner/listing')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Publish Listing</h1>
      {eligibility && (
        <div className="space-y-4">
          {eligibility.eligible ? (
            <div className="rounded-lg bg-green-50 p-4 text-green-800">
              <p className="font-semibold">Ready to publish!</p>
              <p className="text-sm mt-1">Your listing meets all requirements.</p>
            </div>
          ) : (
            <div className="rounded-lg bg-red-50 p-4 text-red-800">
              <p className="font-semibold">Cannot publish yet:</p>
              <ul className="mt-2 list-disc list-inside text-sm">
                {eligibility.blockers.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.back()}>Back</Button>
            {eligibility.eligible && (
              <Button onClick={handlePublish} isLoading={isPublishing}>Publish Now</Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
