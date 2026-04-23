'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmActionModal } from '@/components/owner/ConfirmActionModal'
import { ChatBox } from '@/components/shared/ChatBox'
import { rentalRequestsApi } from '@/lib/api/rental-requests'

// Statuses where chat is available (non-terminal)
const CHAT_ACTIVE_STATUSES = ['Pending', 'Accepted']

interface RequestSummary {
  requestId: string
  listingId: string
  tenantName: string
  moveInDate: string
  isRoommateWanted: boolean
  status: string
  submittedAt: string
  contactPhone: string
  specialNotes?: string
  listingTitle: string
  propertyName: string
}

export default function RoomRequestsPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const [requests, setRequests] = useState<RequestSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modal, setModal] = useState<{ type: 'accept' | 'reject'; requestId: string } | null>(null)
  const [isActing, setIsActing] = useState(false)
  // Track which request is expanded to show detail + chat
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  const loadRequests = () => {
    rentalRequestsApi.getRoomRequests(roomId)
      .then(data => {
        // Handle both { requests: [...] } and direct array responses
        const raw = data as Record<string, unknown>
        const list = Array.isArray(data) ? data : (Array.isArray(raw?.requests) ? raw.requests : [])
        setRequests(list)
      })
      .catch(() => setRequests([]))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { loadRequests() }, [roomId])

  const handleAction = async () => {
    if (!modal) return
    setIsActing(true)
    try {
      if (modal.type === 'accept') await rentalRequestsApi.acceptRequest(modal.requestId)
      else await rentalRequestsApi.rejectRequest(modal.requestId)
      setModal(null)
      loadRequests()
    } catch {
      // error state could be added here
    } finally {
      setIsActing(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Room Requests</h1>
      {isLoading ? <LoadingSpinner className="py-12" /> : (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-stone-500">No requests.</p>
          ) : (
            requests.map(r => {
              const isSelected = selectedRequestId === r.requestId
              const isChatActive = CHAT_ACTIVE_STATUSES.includes(r.status)
              return (
                <div key={r.requestId} className="rounded-xl border bg-white overflow-hidden">
                  {/* Request summary row */}
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold">{r.tenantName}</p>
                      <p className="text-sm text-stone-500">Move-in: {r.moveInDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge status={r.status} />
                      {r.status === 'Pending' && (
                        <>
                          <Button size="sm" onClick={() => setModal({ type: 'accept', requestId: r.requestId })}>Accept</Button>
                          <Button variant="danger" size="sm" onClick={() => setModal({ type: 'reject', requestId: r.requestId })}>Reject</Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedRequestId(isSelected ? null : r.requestId)}
                      >
                        {isSelected ? 'Hide' : 'Details'}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded detail + chat — shown when row is selected */}
                  {isSelected && (
                    <div className="border-t border-stone-100 px-4 pb-4 pt-3 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div><span className="font-medium text-stone-500">Room:</span> <span className="text-stone-800">{r.listingTitle}</span></div>
                        <div><span className="font-medium text-stone-500">Property:</span> <span className="text-stone-800">{r.propertyName}</span></div>
                        <div><span className="font-medium text-stone-500">Share:</span> <span className="text-stone-800">{r.isRoommateWanted ? 'Yes' : 'No'}</span></div>
                        <div><span className="font-medium text-stone-500">Contact Phone:</span> <a href={`tel:${r.contactPhone}`} className="text-teal-700 hover:underline">{r.contactPhone}</a></div>
                        <div><span className="font-medium text-stone-500">Submitted:</span> <span className="text-stone-800">{new Date(r.submittedAt).toLocaleDateString()}</span></div>
                        {r.specialNotes && (
                          <div className="sm:col-span-2"><span className="font-medium text-stone-500">Note:</span> <span className="text-stone-800">{r.specialNotes}</span></div>
                        )}
                      </div>

                      {/* Chat section — only for non-terminal requests */}
                      {isChatActive && (
                        <div>
                          <h3 className="mb-3 text-sm font-semibold text-stone-700">Chat with Tenant</h3>
                          <ChatBox requestId={r.requestId} otherPartyName={r.tenantName} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
      <ConfirmActionModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        onConfirm={handleAction}
        title={modal?.type === 'accept' ? 'Accept Request' : 'Reject Request'}
        message={modal?.type === 'accept'
          ? 'Accept this rental request? The listing will be locked.'
          : 'Reject this rental request?'}
        variant={modal?.type === 'reject' ? 'danger' : 'primary'}
        isLoading={isActing}
      />
    </div>
  )
}
