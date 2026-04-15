'use client'

import { useEffect, useState, useCallback } from 'react'
import MapGL, { Marker, Popup } from 'react-map-gl/mapbox'
import Link from 'next/link'
import type { LocationDataDto, ListingSummaryDto } from '@/types/listing'
import 'mapbox-gl/dist/mapbox-gl.css'

const HOA_LAC = { latitude: 21.0133, longitude: 105.5255 }

function formatVND(price: number) {
  return price.toLocaleString('en-US') + '₫'
}

interface SearchMapProps {
  locations: LocationDataDto[]
  listings: ListingSummaryDto[]
  hoveredListingId?: string | null
  onPinClick?: (listingId: string) => void
  onPinHover?: (listingId: string | null) => void
}

export function SearchMap({ locations, listings, hoveredListingId, onPinClick, onPinHover }: SearchMapProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapRef, setMapRef] = useState<any>(null)

  const byId = Object.fromEntries(listings.map(l => [l.listingId, l]))
  const validLocs = locations.filter(l => l.lat && l.lng)

  // Auto-fit bounds when locations change
  useEffect(() => {
    if (!mapRef || validLocs.length === 0) return
    const lngs = validLocs.map(l => l.lng!)
    const lats = validLocs.map(l => l.lat!)
    mapRef.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 50, duration: 500 }
    )
  }, [mapRef, locations]) // eslint-disable-line react-hooks/exhaustive-deps

  const onMapLoad = useCallback((evt: { target: unknown }) => {
    setMapRef(evt.target)
  }, [])

  if (!accessToken) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl bg-stone-100 text-stone-400 text-sm">
        Map unavailable
      </div>
    )
  }

  const selectedLoc = validLocs.find(l => l.listingId === selectedId)
  const selectedListing = selectedId ? byId[selectedId] : null

  return (
    <MapGL
      mapboxAccessToken={accessToken}
      initialViewState={{
        ...HOA_LAC,
        zoom: 13,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onLoad={onMapLoad}
    >
      {validLocs.map(loc => {
        const listing = byId[loc.listingId]
        const isActive = hoveredListingId === loc.listingId || selectedId === loc.listingId
        return (
          <Marker
            key={loc.listingId}
            latitude={loc.lat!}
            longitude={loc.lng!}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              const next = selectedId === loc.listingId ? null : loc.listingId
              setSelectedId(next)
              if (next) onPinClick?.(next)
            }}
          >
            <div
              onMouseEnter={() => onPinHover?.(loc.listingId)}
              onMouseLeave={() => onPinHover?.(null)}
              className={[
                'flex items-center justify-center rounded-full px-2 py-1 text-xs font-bold text-white shadow-md',
                'cursor-pointer select-none whitespace-nowrap transition-all duration-150',
                isActive
                  ? 'bg-teal-500 scale-125 ring-2 ring-white'
                  : 'bg-teal-600 hover:bg-teal-500 hover:scale-110',
              ].join(' ')}
            >
              {listing ? formatVND(listing.price) : '•'}
            </div>
          </Marker>
        )
      })}

      {/* Popup for selected pin */}
      {selectedLoc && selectedListing && (
        <Popup
          latitude={selectedLoc.lat!}
          longitude={selectedLoc.lng!}
          closeOnClick={false}
          onClose={() => setSelectedId(null)}
          anchor="bottom"
          offset={15}
        >
          <div className="p-1 min-w-[150px]">
            <p className="font-semibold text-stone-800 text-sm line-clamp-2">{selectedListing.title}</p>
            <p className="mt-1 text-teal-700 font-bold text-sm">
              {formatVND(selectedListing.price)}
              <span className="ml-0.5 text-stone-400 font-normal text-xs">/mo</span>
            </p>
            <Link
              href={`/room/${selectedListing.listingId}`}
              className="mt-2 block text-center rounded-md bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              View Details
            </Link>
          </div>
        </Popup>
      )}
    </MapGL>
  )
}
