import Link from 'next/link'
import type { ListingSummaryDto } from '@/types/listing'
import { Badge } from '@/components/ui/Badge'

/** Format a number as Vietnamese Dong: 1500000 → "1,500,000₫" */
function formatVND(price: number): string {
  return price.toLocaleString('en-US') + '₫'
}

interface ListingCardProps {
  listing: ListingSummaryDto
  /** Highlight ring when the corresponding map pin is hovered */
  isHighlighted?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function ListingCard({ listing, isHighlighted, onMouseEnter, onMouseLeave }: ListingCardProps) {
  return (
    // Wrapper div: provides id for scroll-to, mouse events for map sync, and highlight ring
    <div
      id={`listing-${listing.listingId}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`rounded-2xl transition-all duration-200 ${isHighlighted ? 'ring-2 ring-teal-400' : ''}`}
    >
    <Link
      href={`/room/${listing.listingId}`}
      className="group block rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-lg hover:border-teal-200 hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
        {listing.firstImageUrl ? (
          <>
            <img
              src={listing.firstImageUrl}
              alt={listing.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
            <svg className="w-10 h-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-stone-900 truncate group-hover:text-teal-700 transition-colors">
          {listing.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-stone-400 truncate">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {listing.address}
        </p>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="text-base font-bold text-teal-700">{formatVND(listing.price)}</span>
            <span className="text-xs text-stone-400">/mo</span>
          </div>
          <span className="text-xs text-stone-500 bg-stone-50 border border-stone-100 rounded-full px-2.5 py-0.5">
            {listing.capacity} pax
          </span>
        </div>

        <div className="mt-2.5">
          <Badge status={listing.furnishedStatus} />
        </div>
      </div>
    </Link>
    </div>
  )
}
