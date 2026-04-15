# Phase 02: Search Page Integration

## Context

- [plan.md](./plan.md)
- [Phase 01](./phase-01-frontend-setup.md) — SearchMap component (prerequisite)
- [search/page.tsx](/frontend/src/app/(visitor)/search/page.tsx) — current search page (124 lines)
- [ListingCard.tsx](/frontend/src/app/(visitor)/search/ListingCard.tsx) — listing card (64 lines)

## Overview

- **Priority:** P1
- **Status:** pending (blocked by Phase 01)
- **Effort:** 1.5h
- **Description:** Wire SearchMap into search page with split-view layout and card-pin interaction

## Key Insights

- `page.tsx` currently discards `locationData` from API response — need to store in state
- `ListingCard` is wrapped in a `<Link>` — mouse events need a wrapper `<div>` around `<Link>`
- Must filter `locationData` to match `filteredListings` (client-side filter may reduce visible listings)
- Mobile tabs avoid rendering the map when "List" tab active (perf)

## Requirements

### Functional
- Desktop (>=lg): side-by-side layout — listings left, sticky map right
- Mobile (<lg): "List" / "Map" tab toggle above results
- Map pins match currently filtered listings only
- Hover card → highlight pin; hover pin → highlight card
- Click pin InfoWindow "View" → navigate to room detail

### Non-Functional
- Map panel sticky on scroll (desktop)
- No CLS from map loading
- Map hidden on mobile "List" tab to save resources

## Related Code Files

### Modify
- `frontend/src/app/(visitor)/search/page.tsx` — layout, state, locationData
- `frontend/src/app/(visitor)/search/ListingCard.tsx` — hover props, highlight ring

### No Changes
- `frontend/src/app/(visitor)/search/SearchForm.tsx` — no modifications needed
- `frontend/src/components/shared/search-map.tsx` — created in Phase 01

## Implementation Steps

### Step 1: Store `locationData` in page state

In `page.tsx`:

```tsx
import type { ListingSummaryDto, SearchCriteriaDto, LocationDataDto } from '@/types/listing'

// Add state
const [locationData, setLocationData] = useState<LocationDataDto[]>([])
```

Update both data-fetch points:

```tsx
// In useEffect (getSearchPage):
.then(data => {
  setAllListings(data.summaries)
  setLocationData(data.locationData ?? [])
})

// In handleSearch:
const data = await listingsApi.searchRooms(criteria)
setAllListings(data.summaries)
setLocationData(data.locationData ?? [])
```

### Step 2: Add interaction state

```tsx
const [hoveredListingId, setHoveredListingId] = useState<string | null>(null)
const [activeView, setActiveView] = useState<'list' | 'map'>('list') // mobile only
```

### Step 3: Compute filtered location data

```tsx
const filteredLocationData = useMemo(() => {
  const visibleIds = new Set(filteredListings.map(l => l.listingId))
  return locationData.filter(loc => visibleIds.has(loc.listingId))
}, [filteredListings, locationData])
```

### Step 4: Add mobile tab toggle

Insert below the "Available Rooms" count badge, inside the results block:

```tsx
{/* Mobile view toggle */}
<div className="mb-4 flex gap-2 lg:hidden">
  <button
    onClick={() => setActiveView('list')}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      activeView === 'list'
        ? 'bg-teal-600 text-white'
        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
    }`}
  >
    List
  </button>
  <button
    onClick={() => setActiveView('map')}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      activeView === 'map'
        ? 'bg-teal-600 text-white'
        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
    }`}
  >
    Map
  </button>
</div>
```

### Step 5: Restructure results layout for split view

Replace the current grid `<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">` with:

```tsx
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
  {/* Left panel: listing cards */}
  <div className={`${activeView === 'map' ? 'hidden lg:block' : ''}`}>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {filteredListings.map(listing => (
        <ListingCard
          key={listing.listingId}
          listing={listing}
          isHighlighted={hoveredListingId === listing.listingId}
          onHover={setHoveredListingId}
        />
      ))}
    </div>
  </div>

  {/* Right panel: map */}
  <div className={`${activeView === 'list' ? 'hidden lg:block' : ''}`}>
    <div className="sticky top-4 h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-stone-200 shadow-sm">
      <SearchMap
        locations={filteredLocationData}
        listings={filteredListings}
        hoveredListingId={hoveredListingId ?? undefined}
        onPinClick={(id) => {
          // Scroll to card on desktop
          const el = document.getElementById(`listing-${id}`)
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }}
        onPinHover={setHoveredListingId}
        className="h-full w-full"
      />
    </div>
  </div>
</div>
```

**Note:** Grid changes from `lg:grid-cols-3 xl:grid-cols-4` to `lg:grid-cols-2` (one column for cards, one for map). Cards sub-grid becomes `sm:grid-cols-2` to keep 2 columns within the left panel.

### Step 6: Add import for SearchMap

```tsx
import { SearchMap } from '@/components/shared/search-map'
```

### Step 7: Modify ListingCard to support hover + highlight

Update `ListingCard` props and wrapper:

```tsx
interface ListingCardProps {
  listing: ListingSummaryDto
  isHighlighted?: boolean
  onHover?: (listingId: string | null) => void
}

export function ListingCard({ listing, isHighlighted, onHover }: ListingCardProps) {
  return (
    <div
      id={`listing-${listing.listingId}`}
      onMouseEnter={() => onHover?.(listing.listingId)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Link
        href={`/room/${listing.listingId}`}
        className={`group block rounded-2xl border bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${
          isHighlighted
            ? 'border-teal-400 ring-2 ring-teal-200'
            : 'border-stone-200 hover:border-teal-200'
        }`}
      >
        {/* ...existing content unchanged... */}
      </Link>
    </div>
  )
}
```

Key changes:
- Add `id` for scroll-to-card on pin click
- Wrap `<Link>` in `<div>` for mouse events
- Conditional border/ring classes for highlight state
- Props are optional — existing usage without props still works (backward compatible)

### Step 8: Verify compilation and build

```bash
cd frontend && npx tsc --noEmit && npm run build
```

## Todo List

- [ ] Store `locationData` in page.tsx state
- [ ] Add `hoveredListingId` and `activeView` state
- [ ] Compute `filteredLocationData` (sync with filtered listings)
- [ ] Add mobile List/Map tab toggle
- [ ] Restructure to split-view layout (lg:grid-cols-2)
- [ ] Integrate SearchMap component with props
- [ ] Add scroll-to-card on pin click
- [ ] Update ListingCard: hover events, highlight ring, id attribute
- [ ] Verify backward compatibility (ListingCard without new props)
- [ ] Run `npx tsc --noEmit` — 0 errors
- [ ] Run `npm run build` — 0 errors

## Success Criteria

- Desktop: split view with sticky map, listings scroll independently
- Mobile: tab toggle switches between list and map views
- Hover card highlights pin; hover pin highlights card
- Filter listings updates map pins in sync
- Click pin → card scrolls into view
- No TypeScript or build errors
- No visual regression on existing search layout (mobile list view looks same as before)

## Edge Cases / Error Handling

| Scenario | Behavior |
|----------|----------|
| 0 listings with location data | Map shows "No map data" placeholder |
| Some listings have location, others don't | Only located listings get pins; all appear in card list |
| API key missing | Map panel shows "Map unavailable" message, list still works |
| User on slow connection | Map lazy-loads; list renders immediately |
| Window resize (desktop ↔ mobile) | CSS handles via `lg:` breakpoint, `activeView` only controls mobile |

## Security Considerations

- No new API calls or auth changes
- `scrollIntoView` is DOM-only, no XSS vector
- `hoveredListingId` is a listing UUID, validated by existence in data

## Next Steps

After this phase: proceed to [Phase 03](./phase-03-testing.md) for manual and automated validation.
