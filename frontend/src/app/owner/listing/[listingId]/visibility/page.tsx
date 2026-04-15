'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmActionModal } from '@/components/owner/ConfirmActionModal'
import { listingsApi } from '@/lib/api/listings'

export default function VisibilityPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const router = useRouter()
  const [status, setStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [action, setAction] = useState<'Hide' | 'Show'>('Hide')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    listingsApi.getVisibility(listingId).then(d => setStatus(d.status))
  }, [listingId])

  const handleAction = async () => {
    setIsLoading(true)
    try {
      await listingsApi.changeVisibility(listingId, action)
      router.push('/owner/listing')
    } catch {
      // error handled by redirect failure
    } finally {
      setIsLoading(false)
    }
  }

  const prepareAction = (a: 'Hide' | 'Show') => {
    setAction(a)
    setShowModal(true)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Listing Visibility</h1>
      <div className="rounded-xl border bg-white p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-stone-600">Current status:</span>
          <Badge status={status} />
        </div>
        <div className="flex gap-3">
          {status === 'PublishedAvailable' && (
            <Button variant="secondary" onClick={() => prepareAction('Hide')}>Hide Listing</Button>
          )}
          {status === 'Hidden' && (
            <Button onClick={() => prepareAction('Show')}>Show Listing</Button>
          )}
          <Button variant="ghost" onClick={() => router.back()}>Back</Button>
        </div>
      </div>
      <ConfirmActionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleAction}
        title={`${action} Listing`}
        message={`Are you sure you want to ${action.toLowerCase()} this listing?`}
        isLoading={isLoading}
      />
    </div>
  )
}
