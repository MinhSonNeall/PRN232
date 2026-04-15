'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmActionModal } from '@/components/owner/ConfirmActionModal'
import { adminApi } from '@/lib/api/admin'

interface ListingDetail {
  listingId: string
  title: string
  description?: string
  ownerName: string
  ownerEmail: string
  price: number
  status: string
  address: string
  images: string[]
}

export default function AdminListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const router = useRouter()
  const [detail, setDetail] = useState<ListingDetail | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isDisabling, setIsDisabling] = useState(false)

  useEffect(() => {
    adminApi.getListingDetails(listingId).then(d => setDetail(d as ListingDetail))
  }, [listingId])

  const handleDisable = async () => {
    setIsDisabling(true)
    try {
      await adminApi.disableListing(listingId)
      router.push('/admin/listings')
    } catch {
      // error state could be added here
    } finally {
      setIsDisabling(false)
    }
  }

  if (!detail) return <LoadingSpinner className="py-12" text="Loading listing details..." />

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.push('/admin/listings')} className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-teal-600 transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to listings
      </button>

      <h1 className="mb-6 text-2xl font-bold text-stone-900">{detail.title}</h1>

      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm mb-6">
        <div className="space-y-4">
          <DetailRow label="Owner" value={`${detail.ownerName} (${detail.ownerEmail})`} />
          <DetailRow label="Price" value={`${detail.price.toLocaleString('vi-VN')} VND/mo`} />
          <DetailRow label="Address" value={detail.address} />
          <DetailRow label="Status">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              detail.status === 'PublishedAvailable' ? 'bg-emerald-50 text-emerald-700' :
              detail.status === 'Archived' ? 'bg-stone-100 text-stone-600' :
              'bg-amber-50 text-amber-700'
            }`}>{detail.status}</span>
          </DetailRow>
          {detail.description && (
            <div className="pt-2 border-t border-stone-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Description</span>
              <p className="mt-1.5 text-sm text-stone-700 leading-relaxed">{detail.description}</p>
            </div>
          )}
        </div>
      </div>

      {detail.status !== 'Archived' && (
        <Button variant="danger" onClick={() => setShowModal(true)}>Disable Listing</Button>
      )}
      <ConfirmActionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDisable}
        title="Disable Listing"
        message="This will forcibly remove the listing from public view. The owner will be notified."
        variant="danger"
        isLoading={isDisabling}
      />
    </div>
  )
}

function DetailRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="text-sm font-medium text-stone-400 w-20 shrink-0">{label}</span>
      {children ?? <span className="text-sm text-stone-800">{value}</span>}
    </div>
  )
}
