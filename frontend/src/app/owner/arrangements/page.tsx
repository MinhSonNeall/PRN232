'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmActionModal } from '@/components/owner/ConfirmActionModal'
import { listingsApi } from '@/lib/api/listings'
import type { AcceptedArrangementDto } from '@/types/listing'

export default function ArrangementsPage() {
  const [arrangements, setArrangements] = useState<AcceptedArrangementDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [revokeTarget, setRevokeTarget] = useState<AcceptedArrangementDto | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  const load = () => {
    setIsLoading(true)
    listingsApi.getAcceptedArrangements().then(setArrangements).finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRevoke = async () => {
    if (!revokeTarget) return
    setIsRevoking(true)
    try {
      await listingsApi.reopenListing(revokeTarget.requestId)
      setRevokeTarget(null)
      load()
    } catch { /* ignore */ } finally {
      setIsRevoking(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Accepted Arrangements</h1>
        <p className="mt-0.5 text-sm text-stone-500">Manage accepted tenant requests. Revoking will unlock the room for new tenants.</p>
      </div>

      {isLoading ? <LoadingSpinner className="py-12" text="Loading arrangements..." /> : (
        <div className="space-y-3">
          {arrangements.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
              <svg className="h-12 w-12 text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-base font-medium text-stone-500">No accepted arrangements</p>
              <p className="mt-1 text-sm text-stone-400">When you accept a tenant request, it will appear here</p>
            </div>
          ) : (
            arrangements.map(a => (
              <div key={a.requestId} className="rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge status="Locked" />
                        <h3 className="font-semibold text-stone-900 truncate">{a.listingTitle}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/room/${a.listingId}`}>
                        <Button variant="ghost" size="sm">View Room</Button>
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => setRevokeTarget(a)}>Revoke</Button>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-stone-400 text-xs">Tenant</span>
                      <p className="font-medium text-stone-700">{a.tenantName}</p>
                    </div>
                    <div>
                      <span className="text-stone-400 text-xs">Move-in Date</span>
                      <p className="font-medium text-stone-700">{a.moveInDate}</p>
                    </div>
                    <div>
                      <span className="text-stone-400 text-xs">Accepted At</span>
                      <p className="font-medium text-stone-700">{new Date(a.acceptedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-stone-400 text-xs">Status</span>
                      <p className="font-medium text-teal-600">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ConfirmActionModal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Revoke Arrangement?"
        message={`This will revoke the accepted request for "${revokeTarget?.listingTitle ?? ''}" and unlock the room for new tenants. The tenant will be notified.`}
        variant="danger"
        isLoading={isRevoking}
      />
    </div>
  )
}
