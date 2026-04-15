'use client'

import MapGL, { Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapEmbedProps {
  lat?: number | null
  lng?: number | null
}

export function MapEmbed({ lat, lng }: MapEmbedProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  if (!accessToken || !lat || !lng) {
    return (
      <div className="h-48 rounded-xl bg-stone-100 flex items-center justify-center text-sm text-stone-400">
        Map unavailable
      </div>
    )
  }

  return (
    <div className="h-48 w-full rounded-xl overflow-hidden">
      <MapGL
        mapboxAccessToken={accessToken}
        initialViewState={{ latitude: lat, longitude: lng, zoom: 15 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        scrollZoom={false}
        dragPan={false}
        dragRotate={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
      >
        <Marker latitude={lat} longitude={lng} />
      </MapGL>
    </div>
  )
}
