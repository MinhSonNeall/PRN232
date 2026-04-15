'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LocationPicker } from '@/components/shared/location-picker'
import { propertiesApi } from '@/lib/api/properties'

export default function NewPropertyPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: '',
    address: '',
    mapLocation: '',
    description: '',
    generalPolicies: '',
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setSelectedFiles(prev => [...prev, ...files])
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      let imageUrls: string[] = []

      // Upload images if any
      if (selectedFiles.length > 0) {
        const formData = new FormData()
        selectedFiles.forEach(f => formData.append('images', f))
        const result = await propertiesApi.processImages(formData)
        imageUrls = result.imageUrls
      }

      await propertiesApi.createProperty({ ...form, imageUrls })
      router.push('/owner/property')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Create Property</h1>
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
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {previews.map((src, i) => (
                <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-stone-200">
                  <img src={src} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
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
        <Button type="submit" isLoading={isLoading} className="w-full">
          {isLoading ? 'Creating...' : 'Create Property'}
        </Button>
      </form>
    </div>
  )
}
