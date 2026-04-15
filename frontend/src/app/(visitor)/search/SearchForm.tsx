'use client'

import { useState } from 'react'
import type { SearchCriteriaDto } from '@/types/listing'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface SearchFormProps {
  onSearch: (criteria: SearchCriteriaDto) => void
  /** Called on every field change — enables instant client-side filtering */
  onCriteriaChange?: (criteria: SearchCriteriaDto) => void
  isLoading?: boolean
}

const SELECT_CLASS = 'block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white'

export function SearchForm({ onSearch, onCriteriaChange, isLoading }: SearchFormProps) {
  const [criteria, setCriteria] = useState<SearchCriteriaDto>({})
  /** Display string for amenities — kept separate to avoid join/split on every render */
  const [amenitiesText, setAmenitiesText] = useState('')

  const update = (patch: Partial<SearchCriteriaDto>) => {
    const next = { ...criteria, ...patch }
    setCriteria(next)
    onCriteriaChange?.(next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(criteria)
  }

  const handleClear = () => {
    setCriteria({})
    setAmenitiesText('')
    onCriteriaChange?.({})
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-lg border border-stone-100">
      {/* Row 1: location, price, price, furnished */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Location"
          placeholder="e.g. District 1, Hanoi..."
          value={criteria.location ?? ''}
          onChange={e => update({ location: e.target.value || undefined })}
        />
        <Input
          label="Min Price (₫)"
          type="number"
          placeholder="0"
          value={criteria.minPrice ?? ''}
          onChange={e => update({ minPrice: e.target.value ? +e.target.value : undefined })}
        />
        <Input
          label="Max Price (₫)"
          type="number"
          placeholder="No limit"
          value={criteria.maxPrice ?? ''}
          onChange={e => update({ maxPrice: e.target.value ? +e.target.value : undefined })}
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700">Furnished</label>
          <select
            className={SELECT_CLASS}
            value={criteria.furnishedStatus ?? ''}
            onChange={e => update({ furnishedStatus: e.target.value || undefined })}
          >
            <option value="">Any</option>
            <option value="FullyFurnished">Fully Furnished</option>
            <option value="PartiallyFurnished">Partially Furnished</option>
            <option value="Unfurnished">Unfurnished</option>
          </select>
        </div>
      </div>

      {/* Row 2: available from, private WC, amenities (server-side filters) */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700">Available From</label>
          <input
            type="date"
            className={SELECT_CLASS}
            value={criteria.availableFrom ?? ''}
            onChange={e => update({ availableFrom: e.target.value || undefined })}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700">Private WC</label>
          <select
            className={SELECT_CLASS}
            value={criteria.privateWC === undefined ? '' : String(criteria.privateWC)}
            onChange={e => update({ privateWC: e.target.value === '' ? undefined : e.target.value === 'true' })}
          >
            <option value="">Any</option>
            <option value="true">Private</option>
            <option value="false">Shared / None</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700">Amenities</label>
          <input
            type="text"
            className={SELECT_CLASS}
            placeholder="e.g. WiFi, AC, Parking"
            value={amenitiesText}
            onChange={e => {
              setAmenitiesText(e.target.value)
              const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              update({ amenities: arr.length > 0 ? arr : undefined })
            }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
        <button
          type="button"
          className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          onClick={handleClear}
        >
          Clear filters
        </button>
        <Button type="submit" size="lg" isLoading={isLoading}>
          Search Rooms
        </Button>
      </div>
    </form>
  )
}
