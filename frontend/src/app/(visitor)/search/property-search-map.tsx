'use client'

import { useEffect, useState, useCallback } from 'react'
import MapGL, { Marker, Popup } from 'react-map-gl/mapbox'
import Link from 'next/link'
import type { PropertyLocationDataDto, PropertySearchSummaryDto } from '@/types/listing'
import 'mapbox-gl/dist/mapbox-gl.css'

const HOA_LAC = { latitude: 21.0133, longitude: 105.5255 }

function formatVND(price: number) {
  return price.toLocaleString('en-US') + '₫'
}

/** Show price range label for map pin */
function priceLabel(min?: number, max?: number): string {
  if (!min && !max) return '•'
  if (min === max || !max) return formatVND(min!)
  return `${formatVND(min!)} – ${formatVND(max)}`
}

interface PropertySearchMapProps {
  propertyLocations: PropertyLocationDataDto[]
  properties: PropertySearchSummaryDto[]
  hoveredPropertyId?: string | null
  onPinClick?: (propertyId: string) => void
  onPinHover?: (propertyId: string | null) => void
}

export function PropertySearchMap({ propertyLocations, properties, hoveredPropertyId, onPinClick, onPinHover }: PropertySearchMapProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapRef, setMapRef] = useState<any>(null)

  const propById = Object.fromEntries(properties.map(p => [p.propertyId, p]))
  const validLocs = propertyLocations.filter(l => l.lat && l.lng)

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
  }, [mapRef, propertyLocations]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const selectedLoc = validLocs.find(l => l.propertyId === selectedId)
  const selectedProp = selectedId ? propById[selectedId] : null

  return (
    <MapGL
      mapboxAccessToken={accessToken}
      initialViewState={{ ...HOA_LAC, zoom: 13 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onLoad={onMapLoad}
    >
      {validLocs.map(loc => {
        const isActive = hoveredPropertyId === loc.propertyId || selectedId === loc.propertyId
        return (
          <Marker
            key={loc.propertyId}
            latitude={loc.lat!}
            longitude={loc.lng!}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              const next = selectedId === loc.propertyId ? null : loc.propertyId
              setSelectedId(next)
              if (next) onPinClick?.(next)
            }}
          >
            <div
              onMouseEnter={() => onPinHover?.(loc.propertyId)}
              onMouseLeave={() => onPinHover?.(null)}
              className={[
                'flex items-center justify-center rounded-full px-2 py-1 text-[10px] font-bold text-white shadow-md',
                'cursor-pointer select-none whitespace-nowrap transition-all duration-150',
                isActive
                  ? 'bg-teal-500 scale-125 ring-2 ring-white'
                  : 'bg-teal-600 hover:bg-teal-500 hover:scale-110',
              ].join(' ')}
            >
              {priceLabel(loc.minPrice, loc.maxPrice)}
            </div>
          </Marker>
        )
      })}

      {/* Popup for selected property pin */}
      {selectedLoc && selectedProp && (
        <Popup
          latitude={selectedLoc.lat!}
          longitude={selectedLoc.lng!}
          closeOnClick={false}
          onClose={() => setSelectedId(null)}
          anchor="bottom"
          offset={15}
        >
          <div className="p-1.5 min-w-[160px]">
            <p className="font-bold text-stone-800 text-sm line-clamp-1">{selectedProp.name}</p>
            <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{selectedProp.address}</p>
            <p className="mt-1 text-xs text-stone-600">
              <span className="font-semibold text-teal-700">{selectedProp.listingCount}</span> {selectedProp.listingCount === 1 ? 'room' : 'rooms'} available
            </p>
            {selectedLoc.minPrice && (
              <p className="mt-0.5 text-xs text-teal-700 font-semibold">
                {priceLabel(selectedLoc.minPrice, selectedLoc.maxPrice)}
                <span className="ml-0.5 text-stone-400 font-normal">/mo</span>
              </p>
            )}
            <Link
              href={`/property/${selectedProp.propertyId}`}
              className="mt-2 block text-center rounded-md bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              View Property
            </Link>
          </div>
        </Popup>
      )}
    </MapGL>
  )
}
