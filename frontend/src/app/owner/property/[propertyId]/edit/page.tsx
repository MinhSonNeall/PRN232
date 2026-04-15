'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LocationPicker } from '@/components/shared/location-picker'
import { propertiesApi } from '@/lib/api/properties'

export default function EditPropertyPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: '',
    address: '',
    mapLocation: '',
    description: '',
    generalPolicies: '',
  })
  // Existing uploaded image URLs from the server
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])
  // Newly selected files not yet uploaded
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    propertiesApi.getPropertyForEdit(propertyId)
      .then(data => {
        setForm({
          name: data.name,
          address: data.address,
          mapLocation: data.mapLocation ?? '',
          description: data.description ?? '',
          generalPolicies: data.generalPolicies ?? '',
        })
        setExistingImageUrls(data.imageUrls ?? [])
      })
      .finally(() => setIsLoading(false))
  }, [propertyId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setSelectedFiles(prev => [...prev, ...files])
    const previews = files.map(f => URL.createObjectURL(f))
    setNewPreviews(prev => [...prev, ...previews])
  }

  const removeExistingImage = (index: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newPreviews[index])
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      let uploadedNewUrls: string[] = []

      // Upload new files if any
      if (selectedFiles.length > 0) {
        const formData = new FormData()
        selectedFiles.forEach(f => formData.append('newImages', f))
        const result = await propertiesApi.processUpdateImages(propertyId, formData)
        uploadedNewUrls = result.imageUrls
      }

      const allImageUrls = [...existingImageUrls, ...uploadedNewUrls]
      await propertiesApi.updateProperty(propertyId, { ...form, imageUrls: allImageUrls })
      router.push('/owner/property')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="py-12 text-center">Loading...</div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Edit Property</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name *"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <Input
          label="Address *"
          value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          required
        />
        <LocationPicker
          value={form.mapLocation}
          onChange={val => setForm(f => ({ ...f, mapLocation: val }))}
        />
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
          <textarea
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            rows={3}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">General Policies</label>
          <textarea
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            rows={3}
            value={form.generalPolicies}
            onChange={e => setForm(f => ({ ...f, generalPolicies: e.target.value }))}
          />
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">Property Images</label>
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
            className="rounded-lg border border-dashed border-stone-300 px-4 py-2 text-sm text-stone-500 hover:border-teal-400 hover:text-teal-600 transition-colors"
          >
            Add Images
          </button>

          {/* Existing + new image previews */}
          {(existingImageUrls.length > 0 || newPreviews.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {existingImageUrls.map((src, i) => (
                <div key={`existing-${i}`} className="relative h-20 w-20 rounded-lg overflow-hidden border border-stone-200">
                  <img src={src} alt={`Existing ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute top-0.5 right-0.5 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {newPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative h-20 w-20 rounded-lg overflow-hidden border border-teal-200">
                  <img src={src} alt={`New ${i + 1}`} className="h-full w-full object-cover" />
                  <span className="absolute top-0.5 left-0.5 rounded bg-teal-500 px-1 text-[9px] text-white">New</span>
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-0.5 right-0.5 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" isLoading={isSaving} className="w-full">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}
