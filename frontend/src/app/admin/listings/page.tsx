'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { adminApi } from '@/lib/api/admin'
import type { AdminListingSummaryDto } from '@/types/admin'

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListingSummaryDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    adminApi.getVisibleListings().then(setListings).finally(() => setIsLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Published Listings</h1>
        <p className="mt-1 text-sm text-stone-500">Review and moderate all publicly visible room listings</p>
      </div>
      {isLoading ? <LoadingSpinner className="py-12" /> : (
        <div className="space-y-3">
          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
              <p className="text-base font-medium text-stone-500">No published listings</p>
              <p className="mt-1 text-sm text-stone-400">Listings will appear here once owners publish them</p>
            </div>
          ) : (
            listings.map(l => (
              <div key={l.listingId} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-stone-300">
                <div>
                  <Link
                    href={`/admin/listings/${l.listingId}`}
                    className="font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                  >
                    {l.title}
                  </Link>
                  <p className="text-sm text-stone-500 mt-0.5">{l.ownerName} · {l.price.toLocaleString('vi-VN')} VND/mo</p>
                </div>
                <svg className="h-5 w-5 text-stone-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
