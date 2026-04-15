'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { rentalRequestsApi } from '@/lib/api/rental-requests'
import type { RentalRequestDto } from '@/types/rental-request'

export function RentalRequestForm({ listingId }: { listingId: string }) {
  const router = useRouter()
  const [form, setForm] = useState<RentalRequestDto>({
    listingId,
    moveInDate: '',
    expectedRentalDuration: 1,
    occupantCount: 1,
    contactPhone: '',
    preferredContactMethod: 'Phone',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await rentalRequestsApi.submitRequest(form)
      router.push('/tenant/requests')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Move-in Date"
        type="date"
        value={form.moveInDate}
        onChange={e => setForm(f => ({ ...f, moveInDate: e.target.value }))}
        required
      />
      <Input
        label="Duration (months)"
        type="number"
        min={1}
        value={form.expectedRentalDuration}
        onChange={e => setForm(f => ({ ...f, expectedRentalDuration: +e.target.value }))}
        required
      />
      <Input
        label="Occupants"
        type="number"
        min={1}
        value={form.occupantCount}
        onChange={e => setForm(f => ({ ...f, occupantCount: +e.target.value }))}
        required
      />
      <Input
        label="Contact Phone"
        value={form.contactPhone}
        onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
        required
      />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-stone-700">Preferred Contact</label>
        <select
          className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          value={form.preferredContactMethod}
          onChange={e => setForm(f => ({ ...f, preferredContactMethod: e.target.value }))}
        >
          <option>Phone</option>
          <option>Email</option>
          <option>WhatsApp</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-stone-700">Special Notes</label>
        <textarea
          className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          rows={3}
          value={form.specialNotes ?? ''}
          onChange={e => setForm(f => ({ ...f, specialNotes: e.target.value }))}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" isLoading={isLoading} className="w-full">Submit Request</Button>
    </form>
  )
}
