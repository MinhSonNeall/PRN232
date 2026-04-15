'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { SearchForm } from './SearchForm'
import { PropertyCard } from './PropertyCard'
import { PropertySearchMap } from './property-search-map'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Pagination } from '@/components/ui/Pagination'
import { listingsApi } from '@/lib/api/listings'
import type { SearchCriteriaDto, PropertySearchSummaryDto, PropertyLocationDataDto } from '@/types/listing'

/** Filter properties by criteria (location + price range on their listings) */
function applyPropertyFilter(properties: PropertySearchSummaryDto[], criteria: SearchCriteriaDto): PropertySearchSummaryDto[] {
  return properties.filter(p => {
    if (criteria.location) {
      const loc = criteria.location.toLowerCase()
      const nameMatch = p.name.toLowerCase().includes(loc)
      const addrMatch = p.address.toLowerCase().includes(loc)
      const listingMatch = p.listings.some(l => l.title.toLowerCase().includes(loc))
      if (!nameMatch && !addrMatch && !listingMatch) return false
    }
    if (criteria.minPrice !== undefined) {
      if (!p.listings.some(l => l.price >= criteria.minPrice!)) return false
    }
    if (criteria.maxPrice !== undefined) {
      if (!p.listings.some(l => l.price <= criteria.maxPrice!)) return false
    }
    if (criteria.furnishedStatus) {
      if (!p.listings.some(l => l.furnishedStatus === criteria.furnishedStatus)) return false
    }
    return true
  })
}

function friendlyError(message: string): string {
  if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('networkerror')) {
    return 'Unable to connect to the server. Please make sure the backend is running and try again.'
  }
  return message
}

const ITEMS_PER_PAGE = 8

export default function SearchPage() {
  const [allProperties, setAllProperties] = useState<PropertySearchSummaryDto[]>([])
  const [propertyLocations, setPropertyLocations] = useState<PropertyLocationDataDto[]>([])
  const [liveCriteria, setLiveCriteria] = useState<SearchCriteriaDto>({})
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'list' | 'map'>('list')
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    listingsApi.getSearchPage()
      .then(data => {
        setAllProperties(data.properties)
        setPropertyLocations(data.propertyLocations)
      })
      .catch(err => setError(friendlyError(err.message)))
      .finally(() => setIsLoading(false))
  }, [])

  const handleSearch = async (criteria: SearchCriteriaDto) => {
    setIsSearching(true)
    setError(null)
    try {
      const data = await listingsApi.searchRooms(criteria)
      setAllProperties(data.properties)
      setPropertyLocations(data.propertyLocations)
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : 'Search failed'))
    } finally {
      setIsSearching(false)
    }
  }

  const filteredProperties = useMemo(
    () => applyPropertyFilter(allProperties, liveCriteria),
    [allProperties, liveCriteria]
  )

  const totalRooms = useMemo(
    () => filteredProperties.reduce((sum, p) => sum + p.listingCount, 0),
    [filteredProperties]
  )

  useEffect(() => { setCurrentPage(1) }, [filteredProperties.length])

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)
  const paginatedProperties = useMemo(
    () => filteredProperties.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredProperties, currentPage]
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Map pins for filtered properties only
  const filteredPropertyLocations = useMemo(() => {
    const visibleIds = new Set(filteredProperties.map(p => p.propertyId))
    return propertyLocations.filter(loc => visibleIds.has(loc.propertyId))
  }, [filteredProperties, propertyLocations])

  const hasMapData = filteredPropertyLocations.some(loc => loc.lat && loc.lng)

  const scrollToProperty = useCallback((propertyId: string) => {
    const el = document.getElementById(`property-${propertyId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHoveredPropertyId(propertyId)
    }
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Search Rooms</h1>
        <p className="mt-1 text-sm text-stone-500">Browse properties and their available rooms. Filter by location, price, and amenities.</p>
      </div>

      {/* Search form */}
      <div className="mb-8">
        <SearchForm onSearch={handleSearch} onCriteriaChange={setLiveCriteria} isLoading={isSearching} />
      </div>

      {/* Results */}
      <div className="pb-10">
        {isLoading ? (
          <LoadingSpinner className="py-12" text="Loading properties and rooms..." />
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
            <svg className="mx-auto mb-3 w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={() => {
                setError(null); setIsLoading(true)
                listingsApi.getSearchPage()
                  .then(d => { setAllProperties(d.properties); setPropertyLocations(d.propertyLocations) })
                  .catch(e => setError(friendlyError(e.message)))
                  .finally(() => setIsLoading(false))
              }}
              className="mt-3 text-xs text-red-600 underline hover:text-red-800 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-medium text-stone-500">No properties found</p>
            <p className="mt-1 text-sm text-stone-400">Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            {/* Result counts */}
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Properties</span>
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
                  {filteredProperties.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Rooms</span>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-600">
                  {totalRooms}
                </span>
              </div>
            </div>

            {/* Mobile tab toggle */}
            {hasMapData && (
              <div className="flex gap-2 mb-4 lg:hidden">
                {(['list', 'map'] as const).map(view => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                      activeView === view
                        ? 'bg-teal-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            )}

            {/* Main layout: Property list | Map */}
            <div className={hasMapData ? 'lg:grid lg:grid-cols-[3fr_2fr] lg:gap-6' : ''}>
              {/* Left panel: Property cards */}
              <div className={hasMapData && activeView === 'map' ? 'hidden lg:block' : ''}>
                <div className="space-y-4">
                  {paginatedProperties.map(property => (
                    <PropertyCard
                      key={property.propertyId}
                      property={property}
                      isHighlighted={hoveredPropertyId === property.propertyId}
                      onMouseEnter={() => setHoveredPropertyId(property.propertyId)}
                      onMouseLeave={() => setHoveredPropertyId(null)}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </div>

              {/* Right panel: sticky map with property pins + price ranges */}
              {hasMapData && (
                <div className={`${activeView === 'list' ? 'hidden lg:block' : ''} lg:sticky lg:top-4 lg:self-start`}>
                  <div className="h-[70vh] rounded-xl overflow-hidden shadow-sm border border-stone-200">
                    <PropertySearchMap
                      propertyLocations={filteredPropertyLocations}
                      properties={filteredProperties}
                      hoveredPropertyId={hoveredPropertyId}
                      onPinClick={scrollToProperty}
                      onPinHover={setHoveredPropertyId}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
