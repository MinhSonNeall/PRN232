'use client'
import Link from 'next/link'
import type { RentalRequestSummaryDto } from '@/types/rental-request'
import { RequestStatusBadge } from './RequestStatusBadge'
import { Button } from '@/components/ui/Button'

interface Props {
  requests: RentalRequestSummaryDto[]
  onCancel: (requestId: string) => void
}

export function RequestList({ requests, onCancel }: Props) {
  if (requests.length === 0) return (
    <div className="py-12 text-center text-stone-500">No rental requests yet.</div>
  )
  return (
    <div className="space-y-3">
      {requests.map(r => (
        <div key={r.requestId} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-stone-900">{r.listingTitle}</h3>
              <p className="mt-1 text-sm text-stone-500">
                Move-in: {r.moveInDate} | Share: {r.isRoommateWanted ? 'Yes' : 'No'} | Submitted: {new Date(r.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <RequestStatusBadge status={r.status} />
              <Link
                href={`/tenant/requests/${r.requestId}`}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                View Details
              </Link>
              {r.availableActions.includes('Cancel') && (
                <Button variant="danger" size="sm" onClick={() => onCancel(r.requestId)}>Cancel</Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

