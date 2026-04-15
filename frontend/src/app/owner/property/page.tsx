'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { propertiesApi, type PropertySummaryDto } from '@/lib/api/properties'
import { listingsApi } from '@/lib/api/listings'
import type { ListingResponseDto } from '@/types/listing'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
      <svg className="h-12 w-12 text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <p className="text-base font-medium text-stone-500">No properties yet</p>
      <p className="mt-1 text-sm text-stone-400">Add your first property to get started</p>
    </div>
  )
}

/** Inline listing card with action buttons */
function ListingCard({ listing, onDeleted }: { listing: ListingResponseDto; onDeleted: () => void }) {
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showReopen, setShowReopen] = useState(false)
  const [reopening, setReopening] = useState(false)

  return (
    <div className="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50 px-4 py-3 transition hover:bg-stone-100">
      <div className="flex items-center gap-3 min-w-0">
        <Badge status={listing.status} />
        <span className="text-sm font-medium text-stone-800 truncate">{listing.title}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {/* View room detail */}
        <Link href={`/room/${listing.listingId}`}>
          <Button variant="ghost" size="sm">View</Button>
        </Link>
        {/* Edit is always available */}
        <Link href={`/owner/listing/${listing.listingId}/edit`}>
          <Button variant="ghost" size="sm">Edit</Button>
        </Link>
        {/* Requests — for published listings */}
        {listing.status === 'PublishedAvailable' && (
          <Link href={`/owner/requests/room/${listing.listingId}`}>
            <Button variant="secondary" size="sm">Requests</Button>
          </Link>
        )}
        {listing.status === 'Draft' && (
          <Link href={`/owner/listing/${listing.listingId}/publish`}>
            <Button size="sm">Publish</Button>
          </Link>
        )}
        {listing.status === 'PublishedAvailable' && (
          <Link href={`/owner/listing/${listing.listingId}/visibility`}>
            <Button variant="ghost" size="sm">Hide</Button>
          </Link>
        )}
        {listing.status === 'Hidden' && (
          <Link href={`/owner/listing/${listing.listingId}/visibility`}>
            <Button size="sm">Show</Button>
          </Link>
        )}
        {listing.status === 'Locked' && (
          <>
            <Link href={`/owner/requests/room/${listing.listingId}`}>
              <Button variant="secondary" size="sm">Requests</Button>
            </Link>
            <Button variant="danger" size="sm" onClick={() => setShowReopen(true)}>Reopen</Button>
          </>
        )}
        <button
          onClick={() => setShowDelete(true)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50/80 transition-colors"
          title="Delete listing"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <Modal isOpen={showDelete} title="Delete listing?" onClose={() => setShowDelete(false)}>
        <p className="text-sm text-stone-600">Are you sure you want to delete &quot;{listing.title}&quot;? This cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={deleting}
            onClick={async () => {
              setDeleting(true)
              try {
                await listingsApi.updateListing(listing.listingId, { deleted: true })
                onDeleted()
              } catch { /* ignore */ }
              setDeleting(false)
              setShowDelete(false)
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
      <Modal isOpen={showReopen} title="Reopen listing?" onClose={() => setShowReopen(false)}>
        <p className="text-sm text-stone-600">This will revoke the accepted request and reopen &quot;{listing.title}&quot; for new tenants. The current tenant will be notified.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowReopen(false)}>Cancel</Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={reopening}
            onClick={async () => {
              setReopening(true)
              try {
                await listingsApi.reopenByListing(listing.listingId)
                onDeleted() // triggers data reload
              } catch { /* ignore */ }
              setReopening(false)
              setShowReopen(false)
            }}
          >
            Reopen
          </Button>
        </div>
      </Modal>
    </div>
  )
}

/** Expandable property card with its listings nested below */
function PropertyCard({
  property,
  listings,
  expanded,
  onToggle,
  onListingChanged,
}: {
  property: PropertySummaryDto
  listings: ListingResponseDto[]
  expanded: boolean
  onToggle: () => void
  onListingChanged: () => void
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Property header — click to expand */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-900">{property.name}</h3>
          <p className="text-sm text-stone-500 mt-0.5 truncate">{property.address}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-2.5 py-1">
            {listings.length} listing{listings.length !== 1 ? 's' : ''}
          </span>
          <svg
            className={`h-5 w-5 text-stone-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content: listings + actions */}
      {expanded && (
        <div className="border-t border-stone-100 px-4 pb-4 pt-3 space-y-3">
          {/* Property actions */}
          <div className="flex gap-2">
            <Link href={`/owner/property/${property.propertyId}/edit`}>
              <Button variant="secondary" size="sm">Edit Property</Button>
            </Link>
            <Link href={`/owner/listing/new?propertyId=${property.propertyId}`}>
              <Button size="sm">Add Listing</Button>
            </Link>
          </div>

          {/* Listings list */}
          {listings.length === 0 ? (
            <p className="text-sm text-stone-400 py-3 text-center">No listings for this property yet</p>
          ) : (
            <div className="space-y-2">
              {listings.map(l => (
                <ListingCard key={l.listingId} listing={l} onDeleted={onListingChanged} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function OwnerPropertyPage() {
  const [properties, setProperties] = useState<PropertySummaryDto[]>([])
  const [listings, setListings] = useState<ListingResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadData = () => {
    setIsLoading(true)
    Promise.all([
      propertiesApi.getMyProperties(),
      listingsApi.getOwnerListings(),
    ]).then(([props, lsts]) => {
      setProperties(props)
      setListings(lsts)
      // Auto-expand first property
      if (props.length > 0 && !expandedId) setExpandedId(props[0].propertyId)
    }).finally(() => setIsLoading(false))
  }

  useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /** Group listings by propertyId */
  const listingsByProperty = (propertyId: string) =>
    listings.filter(l => l.propertyId === propertyId)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Properties</h1>
          <p className="mt-0.5 text-sm text-stone-500">Manage properties and their room listings</p>
        </div>
        <Link href="/owner/property/new"><Button size="sm">Add Property</Button></Link>
      </div>
      {isLoading ? <LoadingSpinner className="py-12" text="Loading properties..." /> : (
        <div className="space-y-3">
          {properties.length === 0 ? (
            <EmptyState />
          ) : (
            properties.map(p => (
              <PropertyCard
                key={p.propertyId}
                property={p}
                listings={listingsByProperty(p.propertyId)}
                expanded={expandedId === p.propertyId}
                onToggle={() => setExpandedId(prev => prev === p.propertyId ? null : p.propertyId)}
                onListingChanged={loadData}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
