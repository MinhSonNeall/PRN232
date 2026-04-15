import Link from 'next/link'
import type { PropertySearchSummaryDto } from '@/types/listing'

function formatVND(price: number): string {
  return price.toLocaleString('en-US') + '₫'
}

interface PropertyCardProps {
  property: PropertySearchSummaryDto
  isHighlighted?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const MAX_VISIBLE_ROOMS = 2

export function PropertyCard({ property, isHighlighted, onMouseEnter, onMouseLeave }: PropertyCardProps) {
  const visibleListings = property.listings.slice(0, MAX_VISIBLE_ROOMS)
  const extraCount = property.listings.length - MAX_VISIBLE_ROOMS

  return (
    <div
      id={`property-${property.propertyId}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
        isHighlighted ? 'ring-2 ring-teal-400 border-teal-300' : 'border-stone-200 hover:border-teal-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Left: Property image + info */}
        <div className="sm:w-56 shrink-0">
          <div className="relative h-48 w-full overflow-hidden">
            {property.firstImageUrl ? (
              <>
                <img
                  src={property.firstImageUrl}
                  alt={property.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
              </>
            ) : (
              <div className="flex h-full min-h-[120px] w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                <svg className="w-10 h-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                </svg>
              </div>
            )}
            {/* Property info overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <h3 className="font-bold text-sm truncate drop-shadow-md">{property.name}</h3>
              <p className="flex items-center gap-1 text-xs truncate opacity-90 drop-shadow-md">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {property.address}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Room listings */}
        <div className="flex-1 min-w-0 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {property.listingCount} {property.listingCount === 1 ? 'Room' : 'Rooms'} Available
            </span>
          </div>

          <div className="space-y-2">
            {visibleListings.map(listing => (
              <Link
                key={listing.listingId}
                href={`/room/${listing.listingId}`}
                className="group flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/50 p-2.5 hover:bg-teal-50 hover:border-teal-200 transition-colors"
              >
                {/* Room thumbnail */}
                <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-stone-200">
                  {listing.firstImageUrl ? (
                    <img src={listing.firstImageUrl} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg className="w-5 h-5 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Room info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate group-hover:text-teal-700 transition-colors">
                    {listing.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-stone-500">
                    <span>{listing.capacity} pax</span>
                    <span className="text-stone-300">|</span>
                    <span className="capitalize">{listing.furnishedStatus.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="shrink-0 text-right">
                  <span className="text-sm font-bold text-teal-700">{formatVND(listing.price)}</span>
                  <span className="block text-[10px] text-stone-400">/mo</span>
                </div>
              </Link>
            ))}
          </div>

          {/* See More button */}
          {extraCount > 0 && (
            <Link
              href={`/property/${property.propertyId}`}
              className="mt-2 flex items-center justify-center gap-1 rounded-lg border border-dashed border-stone-300 py-2 text-xs font-medium text-stone-500 hover:text-teal-600 hover:border-teal-300 transition-colors"
            >
              See {extraCount} more {extraCount === 1 ? 'room' : 'rooms'}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          )}

          {/* View property link (always shown for access to property detail) */}
          {extraCount <= 0 && property.listingCount > 0 && (
            <Link
              href={`/property/${property.propertyId}`}
              className="mt-2 inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium transition-colors"
            >
              View property details
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
