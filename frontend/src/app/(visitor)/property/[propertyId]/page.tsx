'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ImageGallery } from '../../room/[listingId]/ImageGallery'
import { MapEmbed } from '../../room/[listingId]/MapEmbed'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { listingsApi } from '@/lib/api/listings'
import type { PropertyDetailDto, MapDto } from '@/types/listing'

function formatVND(price: number): string {
  return price.toLocaleString('en-US') + '₫'
}

export default function PropertyDetailPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const [property, setProperty] = useState<PropertyDetailDto | null>(null)
  const [map, setMap] = useState<MapDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      listingsApi.getPropertyDetails(propertyId),
      listingsApi.getPropertyMap(propertyId).catch(() => null),
    ]).then(([propData, mapData]) => {
      setProperty(propData)
      setMap(mapData)
    }).catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [propertyId])

  if (isLoading) return <LoadingSpinner className="py-16" text="Loading property..." />
  if (error || !property) return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">{error ?? 'Property not found'}</p>
        <Link href="/search" className="mt-3 inline-block text-xs text-red-600 underline hover:text-red-800">
          Back to search
        </Link>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-stone-400">
        <Link href="/search" className="hover:text-teal-600 transition-colors">Search</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-700">{property.name}</span>
      </nav>

      {/* Property images */}
      {property.images.length > 0 && (
        <div className="mb-6">
          <ImageGallery images={property.images} />
        </div>
      )}

      {/* Property info */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">{property.name}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {property.address}
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[2fr_1fr] lg:gap-8">
        {/* Left column */}
        <div>
          {/* Description */}
          {property.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-2">About this property</h2>
              <p className="text-sm text-stone-600 whitespace-pre-line">{property.description}</p>
            </div>
          )}

          {/* General policies */}
          {property.generalPolicies && (
            <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
              <h2 className="text-sm font-semibold text-amber-800 mb-1.5">House Rules & Policies</h2>
              <p className="text-sm text-amber-700 whitespace-pre-line">{property.generalPolicies}</p>
            </div>
          )}

          {/* Room listings */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-3">
              Available Rooms
              <span className="ml-2 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-600">
                {property.listings.length}
              </span>
            </h2>
            {property.listings.length === 0 ? (
              <p className="text-sm text-stone-400">No rooms currently available.</p>
            ) : (
              <div className="space-y-3">
                {property.listings.map(listing => (
                  <Link
                    key={listing.listingId}
                    href={`/room/${listing.listingId}`}
                    className="group flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 shadow-sm hover:shadow-md hover:border-teal-200 transition-all"
                  >
                    {/* Room thumbnail */}
                    <div className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-stone-200">
                      {listing.firstImageUrl ? (
                        <img src={listing.firstImageUrl} alt={listing.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg className="w-6 h-6 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Room info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate group-hover:text-teal-700 transition-colors">
                        {listing.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                        <span>{listing.capacity} pax</span>
                        <span className="text-stone-300">|</span>
                        <span className="capitalize">{listing.furnishedStatus.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="shrink-0 text-right">
                      <span className="text-base font-bold text-teal-700">{formatVND(listing.price)}</span>
                      <span className="block text-xs text-stone-400">/mo</span>
                    </div>

                    {/* Arrow */}
                    <svg className="w-5 h-5 shrink-0 text-stone-300 group-hover:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Map */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {map && (map.lat || map.lng) ? (
            <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm">
              <div className="h-[350px]">
                <MapEmbed lat={map.lat} lng={map.lng} />
              </div>
              <div className="p-3 bg-white">
                <p className="text-xs text-stone-500">{property.address}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center">
              <svg className="mx-auto w-8 h-8 text-stone-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <p className="text-xs text-stone-400">Map not available</p>
              <p className="mt-1 text-sm text-stone-600">{property.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
