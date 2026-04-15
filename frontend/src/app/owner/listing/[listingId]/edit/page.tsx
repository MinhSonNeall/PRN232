'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { listingsApi } from '@/lib/api/listings'

export default function EditListingPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: 0,
    capacity: 1,
    availableFrom: '',
    furnishedStatus: 'FullyFurnished',
    privateWCStatus: 'Private',
    amenities: [] as string[],
  })
  const [amenityInput, setAmenityInput] = useState('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    listingsApi.getListingForEdit(listingId)
      .then(data => {
        const d = data.details ?? (data as unknown as Record<string, unknown>)
        // Parse amenities from JSON string or array
        let amenities: string[] = []
        const rawAmenities = d.amenities as string | string[] | undefined
        if (Array.isArray(rawAmenities)) {
          amenities = rawAmenities
        } else if (typeof rawAmenities === 'string') {
          try { amenities = JSON.parse(rawAmenities) } catch { /* ignore */ }
        }
        setForm({
          title: (d.title as string) ?? '',
          description: (d.description as string) ?? '',
          price: (d.price as number) ?? 0,
          capacity: (d.capacity as number) ?? 1,
          availableFrom: (d.availableFrom as string) ?? '',
          furnishedStatus: (d.furnishedStatus as string) ?? 'FullyFurnished',
          privateWCStatus: (d.privateWCStatus as string) ?? 'Private',
          amenities,
        })
        // Load existing images
        const imgs = ((data as unknown as Record<string, unknown>).imageUrls as string[] | undefined) ?? []
        setExistingImages(imgs)
      })
      .catch(err => setLoadError(err.message))
      .finally(() => setIsLoading(false))
  }, [listingId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setNewFiles(prev => [...prev, ...files])
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const removeExisting = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNew = (index: number) => {
    URL.revokeObjectURL(newPreviews[index])
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      let uploadedUrls: string[] = []

      // Upload new files if any
      if (newFiles.length > 0) {
        const formData = new FormData()
        newFiles.forEach(f => formData.append('newImages', f))
        const result = await listingsApi.processListingUpdate(listingId, formData)
        uploadedUrls = result.imageUrls
      }

      await listingsApi.updateListing(listingId, {
        ...form,
        amenities: JSON.stringify(form.amenities),
        imageUrls: [...existingImages, ...uploadedUrls],
      })
      router.push('/owner/property')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingSpinner className="py-16" text="Loading listing..." />
  if (loadError) return <div className="mx-auto max-w-2xl px-4 py-6"><ErrorMessage message={loadError} /></div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/owner/property" className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-teal-600 transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Properties
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Edit Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <Input label="Price (VND/mo) *" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} required />
        <Input label="Capacity *" type="number" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: +e.target.value }))} required />
        <Input label="Available From *" type="date" value={form.availableFrom} onChange={e => setForm(f => ({ ...f, availableFrom: e.target.value }))} required />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-stone-700">Furnished</label>
            <select className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" value={form.furnishedStatus} onChange={e => setForm(f => ({ ...f, furnishedStatus: e.target.value }))}>
              <option value="FullyFurnished">Fully Furnished</option>
              <option value="PartiallyFurnished">Partially</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-stone-700">WC</label>
            <select className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" value={form.privateWCStatus} onChange={e => setForm(f => ({ ...f, privateWCStatus: e.target.value }))}>
              <option value="Private">Private</option>
              <option value="Shared">Shared</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Amenities</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={amenityInput}
              onChange={e => setAmenityInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && amenityInput.trim()) {
                  e.preventDefault()
                  if (!form.amenities.includes(amenityInput.trim())) {
                    setForm(f => ({ ...f, amenities: [...f.amenities, amenityInput.trim()] }))
                  }
                  setAmenityInput('')
                }
              }}
              placeholder="Type and press Enter (e.g. WiFi, Air Conditioning)"
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="button"
              onClick={() => {
                if (amenityInput.trim() && !form.amenities.includes(amenityInput.trim())) {
                  setForm(f => ({ ...f, amenities: [...f.amenities, amenityInput.trim()] }))
                }
                setAmenityInput('')
              }}
              className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
            >
              Add
            </button>
          </div>
          {form.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.amenities.map(a => (
                <span key={a} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {a}
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, amenities: f.amenities.filter(x => x !== a) }))}
                    className="ml-0.5 text-blue-400 hover:text-blue-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Image upload section */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Room Images</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-stone-300 px-4 py-3 text-sm text-stone-500 hover:border-teal-400 hover:text-teal-600 transition-colors w-full justify-center"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Images
          </button>
          {(existingImages.length > 0 || newPreviews.length > 0) && (
            <div className="grid grid-cols-3 gap-2">
              {existingImages.map((src, i) => (
                <div key={`existing-${i}`} className="relative group rounded-lg overflow-hidden aspect-video bg-stone-100">
                  <img src={src} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(i)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {newPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative group rounded-lg overflow-hidden aspect-video bg-stone-100">
                  <img src={src} alt={`New ${i + 1}`} className="h-full w-full object-cover" />
                  <span className="absolute top-1 left-1 rounded bg-teal-500 px-1.5 py-0.5 text-[10px] font-bold text-white">NEW</span>
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" isLoading={isSaving} className="w-full">Save Changes</Button>
      </form>
    </div>
  )
}
