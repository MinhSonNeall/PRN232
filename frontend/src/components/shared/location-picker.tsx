'use client'

import { useState, useCallback } from 'react'
import MapGL, { Marker } from 'react-map-gl/mapbox'
import type { MapMouseEvent } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

const HOA_LAC = { latitude: 21.0133, longitude: 105.5255 }

interface LocationPickerProps {
  /** Current location string, e.g. "21.0133, 105.5255" */
  value: string
  /** Called with "lat, lng" string when user clicks map */
  onChange: (location: string) => void
}

/** Parse "lat, lng" string back to coordinates */
function parseCoords(value: string): { latitude: number; longitude: number } | null {
  if (!value) return null
  const parts = value.split(',').map(s => parseFloat(s.trim()))
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { latitude: parts[0], longitude: parts[1] }
  }
  return null
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const parsed = parseCoords(value)
  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(parsed)

  const handleClick = useCallback((e: MapMouseEvent) => {
    const { lng, lat } = e.lngLat
    const newPin = { latitude: lat, longitude: lng }
    setPin(newPin)
    onChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
  }, [onChange])

  if (!accessToken) {
    return (
      <div className="h-48 rounded-xl bg-stone-100 flex items-center justify-center text-sm text-stone-400">
        Map unavailable — set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      </div>
    )
  }

  const center = pin ?? parsed ?? HOA_LAC

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-stone-700">
        Map Location <span className="text-stone-400 font-normal">(click to set pin)</span>
      </label>
      <div className="h-64 w-full rounded-xl overflow-hidden border border-stone-200">
        <MapGL
          mapboxAccessToken={accessToken}
          initialViewState={{ ...center, zoom: pin || parsed ? 15 : 13 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onClick={handleClick}
          cursor="crosshair"
        >
          {pin && (
            <Marker latitude={pin.latitude} longitude={pin.longitude} anchor="bottom">
              <svg className="h-8 w-8 text-teal-600 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
              </svg>
            </Marker>
          )}
        </MapGL>
      </div>
      {pin && (
        <p className="text-xs text-stone-500">
          Selected: {pin.latitude.toFixed(6)}, {pin.longitude.toFixed(6)}
          <button
            type="button"
            onClick={() => { setPin(null); onChange('') }}
            className="ml-2 text-red-400 hover:text-red-600"
          >
            Clear
          </button>
        </p>
      )}
    </div>
  )
}
