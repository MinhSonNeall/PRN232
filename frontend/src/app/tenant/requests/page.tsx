'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RequestList } from './RequestList'
import { CancelModal } from './CancelModal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { Button } from '@/components/ui/Button'
import { rentalRequestsApi } from '@/lib/api/rental-requests'
import type { RentalRequestSummaryDto } from '@/types/rental-request'

export default function TenantRequestsPage() {
  const [requests, setRequests] = useState<RentalRequestSummaryDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const loadRequests = () => {
    setIsLoading(true)
    rentalRequestsApi.getMyRequests()
      .then(setRequests)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { loadRequests() }, [])

  const handleCancelClick = (requestId: string) => setCancelTarget(requestId)

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return
    setIsCancelling(true)
    try {
      await rentalRequestsApi.cancelRequest(cancelTarget)
      setToast('Request cancelled successfully')
      setCancelTarget(null)
      loadRequests()
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : 'Cancellation failed')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">My Rental Requests</h1>
        <Link href="/search"><Button size="sm">Find Rooms</Button></Link>
      </div>
      {toast && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{toast}</div>
      )}
      {isLoading ? <LoadingSpinner className="py-12" /> :
       error ? <ErrorMessage message={error} onRetry={loadRequests} /> :
       <RequestList requests={requests} onCancel={handleCancelClick} />}
      <CancelModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  )
}
