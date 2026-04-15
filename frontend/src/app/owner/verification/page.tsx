'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiRequest } from '@/lib/api/api-client'

export default function OwnerVerificationPage() {
  const [status, setStatus] = useState('')
  const [idDocUrl, setIdDocUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    apiRequest<{ currentStatus: string }>('/api/verification/form')
      .then(d => setStatus(d.currentStatus))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await apiRequest('/api/verification', {
        method: 'POST',
        body: JSON.stringify({ idDocumentUrl: idDocUrl, supportingDocUrls: [] }),
      })
      setMessage('Verification submitted for review')
      setStatus('PendingReview')
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Owner Verification</h1>
      <div className="mb-4 flex items-center gap-3">
        <span>Status:</span>
        <Badge status={status || 'Unverified'} />
      </div>
      {message && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{message}</div>
      )}
      {(status === '' || status === 'Unverified' || status === 'Rejected') && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ID Document URL (upload separately and paste URL)"
            value={idDocUrl}
            onChange={e => setIdDocUrl(e.target.value)}
            required
          />
          <Button type="submit" isLoading={isLoading} className="w-full">Submit Verification</Button>
        </form>
      )}
      {status === 'PendingReview' && (
        <p className="text-stone-600">Your verification is under review. We'll notify you once it's processed.</p>
      )}
      {status === 'Verified' && (
        <p className="text-green-700 font-semibold">You are verified and can publish listings.</p>
      )}
    </div>
  )
}
