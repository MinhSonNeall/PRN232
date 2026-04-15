'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { rentalRequestsApi } from '@/lib/api/rental-requests'

interface OwnerRequestSummary {
  requestId: string
  listingId: string
  tenantName: string
  moveInDate: string
  status: string
  submittedAt: string
  contactPhone: string
  specialNotes?: string
  listingTitle: string
  propertyName: string
}

export default function OwnerRequestsPage() {
  const [requests, setRequests] = useState<OwnerRequestSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    rentalRequestsApi.getOwnerAllRequests()
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setRequests(list)
      })
      .catch(() => setRequests([]))
      .finally(() => setIsLoading(false))
  }, [])

  // Group requests by property name
  const grouped = requests.reduce<Record<string, OwnerRequestSummary[]>>((acc, r) => {
    const key = r.propertyName || 'Unknown Property'
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">All Requests</h1>
        <p className="mt-0.5 text-sm text-stone-500">View all rental requests across your properties</p>
      </div>
      {isLoading ? <LoadingSpinner className="py-12" text="Loading requests..." /> : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
          <svg className="h-12 w-12 text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-base font-medium text-stone-500">No requests yet</p>
          <p className="mt-1 text-sm text-stone-400">Requests will appear here when tenants apply for your listings</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([propertyName, items]) => (
            <div key={propertyName}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-400">{propertyName}</h2>
              <div className="space-y-2">
                {items.map(r => {
                  const isExpanded = expandedId === r.requestId
                  return (
                    <div key={r.requestId} className="rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md overflow-hidden">
                      {/* Summary row */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : r.requestId)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900">{r.tenantName}</p>
                          <p className="text-sm text-stone-500 mt-0.5">
                            {r.listingTitle} &middot; Move-in: {r.moveInDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge status={r.status} />
                          <svg
                            className={`h-5 w-5 text-stone-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="border-t border-stone-100 px-4 pb-4 pt-3 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div><span className="font-medium text-stone-500">Room:</span> <span className="text-stone-800">{r.listingTitle}</span></div>
                            <div><span className="font-medium text-stone-500">Property:</span> <span className="text-stone-800">{r.propertyName}</span></div>
                            <div><span className="font-medium text-stone-500">Contact Phone:</span> <a href={`tel:${r.contactPhone}`} className="text-teal-700 hover:underline">{r.contactPhone}</a></div>
                            <div><span className="font-medium text-stone-500">Submitted:</span> <span className="text-stone-800">{new Date(r.submittedAt).toLocaleDateString()}</span></div>
                            {r.specialNotes && (
                              <div className="sm:col-span-2"><span className="font-medium text-stone-500">Note:</span> <span className="text-stone-800">{r.specialNotes}</span></div>
                            )}
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Link href={`/owner/requests/room/${r.listingId}`}>
                              <Button size="sm" variant="secondary">Manage Requests</Button>
                            </Link>
                            <Link href={`/room/${r.listingId}`}>
                              <Button size="sm" variant="ghost">View Room</Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
