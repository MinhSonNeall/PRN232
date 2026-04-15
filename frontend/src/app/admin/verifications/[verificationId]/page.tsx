'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { adminApi } from '@/lib/api/admin'
import type { VerificationDetailDto } from '@/types/admin'

export default function VerificationDetailPage() {
  const { verificationId } = useParams<{ verificationId: string }>()
  const router = useRouter()
  const [detail, setDetail] = useState<VerificationDetailDto | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [isActing, setIsActing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    adminApi.getVerificationDetail(verificationId).then(setDetail)
  }, [verificationId])

  const handleApprove = async () => {
    setIsActing(true)
    try {
      await adminApi.approveVerification(verificationId, reviewNote)
      router.push('/admin/verifications')
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed')
    } finally {
      setIsActing(false)
    }
  }

  const handleReject = async () => {
    if (!reviewNote) { setMessage('Review note is required for rejection'); return }
    setIsActing(true)
    try {
      await adminApi.rejectVerification(verificationId, reviewNote)
      router.push('/admin/verifications')
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed')
    } finally {
      setIsActing(false)
    }
  }

  if (!detail) return <div className="py-12 text-center">Loading...</div>

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Verification Review</h1>
      {message && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{message}</div>
      )}
      <div className="rounded-xl border bg-white p-6 space-y-3 mb-6">
        <div className="flex gap-2">
          <span className="text-stone-500 w-32">Owner</span>
          <span>{detail.ownerName}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-stone-500 w-32">Status</span>
          <Badge status={detail.status} />
        </div>
        <div className="flex gap-2">
          <span className="text-stone-500 w-32">Submitted</span>
          <span>{new Date(detail.submittedAt).toLocaleDateString()}</span>
        </div>
      </div>
      {detail.documentUrls.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Documents</h3>
          <ul className="space-y-1">
            {detail.documentUrls.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline text-sm">
                  Document {i + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {detail.status === 'PendingReview' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Review Note</label>
            <textarea
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              rows={3}
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
              placeholder="Add review note..."
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleApprove} isLoading={isActing}>Approve</Button>
            <Button variant="danger" onClick={handleReject} isLoading={isActing}>Reject</Button>
          </div>
        </div>
      )}
    </div>
  )
}
