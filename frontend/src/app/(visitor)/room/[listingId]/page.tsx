'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImageGallery } from './ImageGallery'
import { MapEmbed } from './MapEmbed'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { listingsApi } from '@/lib/api/listings'
import { chatApi } from '@/lib/api/chat'
import { useAuth } from '@/hooks/use-auth'
import type { RoomDetailDto, MapDto } from '@/types/listing'

export default function RoomDetailPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [room, setRoom] = useState<RoomDetailDto | null>(null)
  const [map, setMap] = useState<MapDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contactingOwner, setContactingOwner] = useState(false)

  useEffect(() => {
    Promise.all([
      listingsApi.getRoomDetails(listingId),
      listingsApi.getMapInformation(listingId).catch(() => null),
    ]).then(([roomData, mapData]) => {
      setRoom(roomData)
      setMap(mapData)
    }).catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [listingId])

  if (isLoading) return <LoadingSpinner className="py-16" text="Loading room details..." />
  if (error || !room) return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <ErrorMessage message={error ?? 'Room not found'} />
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Breadcrumb */}
      <Link
        href="/search"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-teal-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </Link>

      <ImageGallery images={room.imagesRef} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{room.title}</h1>
            <p className="mt-1 text-stone-500">{room.propertyAddress}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge status={room.furnishedStatus} />
            <Badge status={room.privateWCStatus} />
            <span className="text-sm text-stone-600 bg-stone-50 rounded-full px-2.5 py-0.5">{room.capacity} pax</span>
          </div>
          {room.description && <p className="text-stone-700 leading-relaxed">{room.description}</p>}
          {room.amenities.length > 0 && (
            <div>
              <h3 className="font-semibold text-stone-900 mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map(a => (
                  <span key={a} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{a}</span>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-stone-900 mb-2">Location</h3>
            <MapEmbed lat={map?.lat} lng={map?.lng} />
          </div>
        </div>

        <div className="space-y-4">
          {/* Price card with colored top border accent */}
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="p-5">
              <p className="text-3xl font-bold text-blue-600">
                {room.price.toLocaleString('vi-VN')} VND
                <span className="text-sm font-normal text-stone-500">/mo</span>
              </p>
              <p className="mt-1 text-sm text-stone-500">Available from {room.availableFrom}</p>
              <div className="mt-4 space-y-2">
                {authLoading ? null : user?.role === 'Tenant' ? (
                  <>
                    <Link href={`/tenant/requests/new?listingId=${room.listingId}`}>
                      <Button className="w-full" size="lg">Request to Rent</Button>
                    </Link>
                    <button
                      onClick={async () => {
                        setContactingOwner(true)
                        try {
                          const { conversationId } = await chatApi.startConversation(room.ownerId)
                          router.push(`/tenant/chat?c=${conversationId}`)
                        } catch {
                          setContactingOwner(false)
                        }
                      }}
                      disabled={contactingOwner}
                      className="w-full rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-100 transition-colors disabled:opacity-50"
                    >
                      {contactingOwner ? 'Opening chat...' : 'Contact Owner'}
                    </button>
                  </>
                ) : isAuthenticated ? (
                  <p className="text-sm text-stone-500 text-center">Only tenants can request rooms</p>
                ) : (
                  <Link href={`/login?redirect=/room/${room.listingId}`}>
                    <Button variant="secondary" className="w-full">Login to Request</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Property info card */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-stone-900">{room.propertyName}</h3>
            {room.propertyPolicies && (
              <p className="mt-1 text-sm text-stone-600 leading-relaxed">{room.propertyPolicies}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
