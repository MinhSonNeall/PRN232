'use client'
import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { listingsApi } from '@/lib/api/listings'

function NewListingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('propertyId') ?? ''
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    propertyId,
    title: '',
    description: '',
    price: 0,
    capacity: 1,
    availableFrom: '',
    furnishedStatus: 'FullyFurnished',
    privateWCStatus: 'Private',
    imageUrls: [] as string[],
    amenities: [] as string[],
  })
  const [amenityInput, setAmenityInput] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setSelectedFiles(prev => [...prev, ...files])
    // Generate preview URLs
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    // Check if it's an uploaded URL or a local preview
    const uploadedCount = form.imageUrls.length
    if (index < uploadedCount) {
      setForm(f => ({ ...f, imageUrls: f.imageUrls.filter((_, i) => i !== index) }))
    } else {
      const fileIndex = index - uploadedCount
      setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex))
      URL.revokeObjectURL(previews[index])
    }
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      let imageUrls = [...form.imageUrls]

      // Upload new files if any
      if (selectedFiles.length > 0) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('title', form.title)
        formData.append('price', String(form.price))
        formData.append('capacity', String(form.capacity))
        formData.append('availableFrom', form.availableFrom)
        formData.append('furnishedStatus', form.furnishedStatus)
        formData.append('privateWCStatus', form.privateWCStatus)
        selectedFiles.forEach(f => formData.append('images', f))
        const result = await listingsApi.processListing(formData)
        imageUrls = [...imageUrls, ...result.imageUrls]
        setIsUploading(false)
      }

      await listingsApi.saveDraft({ ...form, imageUrls, amenities: JSON.stringify(form.amenities) })
      router.push('/owner/property')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setIsLoading(false)
      setIsUploading(false)
    }
  }

  const allPreviews = [
    ...form.imageUrls,
    ...previews.slice(form.imageUrls.length),
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Property ID"
        value={form.propertyId}
        onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))}
        required
      />
      <Input
        label="Title *"
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        required
      />
      <Input
        label="Description"
        value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
      />
      <Input
        label="Price (VND/mo) *"
        type="number"
        value={form.price}
        onChange={e => setForm(f => ({ ...f, price: +e.target.value }))}
        required
      />
      <Input
        label="Capacity *"
        type="number"
        min={1}
        value={form.capacity}
        onChange={e => setForm(f => ({ ...f, capacity: +e.target.value }))}
        required
      />
      <Input
        label="Available From *"
        type="date"
        value={form.availableFrom}
        onChange={e => setForm(f => ({ ...f, availableFrom: e.target.value }))}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700">Furnished</label>
          <select
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            value={form.furnishedStatus}
            onChange={e => setForm(f => ({ ...f, furnishedStatus: e.target.value }))}
          >
            <option value="FullyFurnished">Fully Furnished</option>
            <option value="PartiallyFurnished">Partially</option>
            <option value="Unfurnished">Unfurnished</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700">WC</label>
          <select
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            value={form.privateWCStatus}
            onChange={e => setForm(f => ({ ...f, privateWCStatus: e.target.value }))}
          >
            <option value="Private">Private</option>
            <option value="Shared">Shared</option>
            <option value="None">None</option>
          </select>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-700">Amenities</label>
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
        <label className="block text-sm font-medium text-stone-700">Room Images</label>
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
        {allPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {allPreviews.map((src, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden aspect-video bg-stone-100">
                <img src={src} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
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
      <Button type="submit" isLoading={isLoading} className="w-full">
        {isUploading ? 'Uploading images...' : 'Save Draft'}
      </Button>
    </form>
  )
}

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Create Listing</h1>
      <Suspense>
        <NewListingContent />
      </Suspense>
    </div>
  )
}
