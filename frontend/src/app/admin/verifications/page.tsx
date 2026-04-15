'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import { adminApi } from '@/lib/api/admin'
import type { VerificationSummaryDto } from '@/types/admin'

export default function AdminVerificationsPage() {
  const [items, setItems] = useState<VerificationSummaryDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    adminApi.getPendingVerifications().then(setItems).finally(() => setIsLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Owner Verifications</h1>
        <p className="mt-1 text-sm text-stone-500">Review and approve owner identity verifications</p>
      </div>
      {isLoading ? <LoadingSpinner className="py-12" /> : (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
              <svg className="h-12 w-12 text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-base font-medium text-stone-500">No pending verifications</p>
              <p className="mt-1 text-sm text-stone-400">All verifications have been reviewed</p>
            </div>
          ) : (
            items.map(v => (
              <div key={v.verificationId} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-stone-300">
                <div>
                  <Link
                    href={`/admin/verifications/${v.verificationId}`}
                    className="font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                  >
                    {v.ownerName}
                  </Link>
                  <p className="text-sm text-stone-500 mt-0.5">
                    Submitted: {new Date(v.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={v.status} />
                  <svg className="h-5 w-5 text-stone-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
