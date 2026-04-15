# Phase 01: Frontend Setup + SearchMap Component

## Context

- [plan.md](./plan.md)
- [LocationDataDto type](/frontend/src/types/listing.ts) — `{ listingId, lat?, lng?, mapUrl? }`
- [MapEmbed (reference)](/frontend/src/app/(visitor)/room/[listingId]/MapEmbed.tsx) — existing iframe approach
- [package.json](/frontend/package.json) — React 19, Next.js 16, Tailwind 4

## Overview

- **Priority:** P1 (blocks phase 02)
- **Status:** pending
- **Effort:** 2h
- **Description:** Install Google Maps React library and create the reusable `SearchMap` component

## Key Insights

- `@vis.gl/react-google-maps` is Google's official React wrapper (~58KB gzipped), supports React 18+
- Must verify React 19 compat — if issues, fallback to `@googlemaps/js-api-loader` + vanilla Google Maps API
- `LocationDataDto.lat` and `lng` are optional — component must filter entries missing coords
- App theme color is teal (`teal-600`/`teal-700`) — pins should match

## Requirements

### Functional
- Map renders all provided locations as clickable pins
- Clicking pin opens InfoWindow with listing name, price, "View" link
- `hoveredListingId` prop highlights corresponding pin (scale + color change)
- Auto-fits bounds to show all pins when locations change
- Empty locations array shows "No map data" placeholder

### Non-Functional
- Map loads lazily (not blocking initial page render)
- Component under 200 lines
- No layout shift when map loads

## Architecture

`SearchMap` is a pure presentational component:
```
Props:
  locations: LocationDataDto[]
  hoveredListingId?: string
  onPinClick?: (listingId: string) => void
  onPinHover?: (listingId: string | null) => void
  className?: string

Internal:
  APIProvider (wraps entire component, reads NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
    Map (controlled, gestureHandling="greedy")
      AdvancedMarker (per location with valid lat/lng)
        Pin (custom: teal bg, white glyph, scale on hover)
      InfoWindow (conditionally rendered for selected pin)
```

## Related Code Files

### Create
- `frontend/src/components/shared/search-map.tsx` — main map component

### Modify
- `frontend/package.json` — add `@vis.gl/react-google-maps`
- `frontend/.env.local` — add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` placeholder

### No Changes
- `frontend/src/types/listing.ts` — types already sufficient

## Implementation Steps

### Step 1: Install dependency

```bash
cd frontend && npm install @vis.gl/react-google-maps
```

Verify install succeeds with React 19. If peer dep conflict, try `--legacy-peer-deps`. If that fails, switch to fallback approach (documented in risk section).

### Step 2: Add environment variable

Add to `frontend/.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here
```

Document in a comment that this key needs Maps JavaScript API enabled in Google Cloud Console.

### Step 3: Create `search-map.tsx`

File: `frontend/src/components/shared/search-map.tsx`

Key structure:

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps'
import type { LocationDataDto, ListingSummaryDto } from '@/types/listing'

interface SearchMapProps {
  locations: LocationDataDto[]
  listings?: ListingSummaryDto[]   // for InfoWindow details
  hoveredListingId?: string
  onPinClick?: (listingId: string) => void
  onPinHover?: (listingId: string | null) => void
  className?: string
}
```

**Key implementation details:**

1. **Filter valid locations** at top of component:
   ```tsx
   const validLocations = locations.filter(
     (loc): loc is LocationDataDto & { lat: number; lng: number } =>
       loc.lat != null && loc.lng != null
   )
   ```

2. **Auto-fit bounds** — create a `MapBoundsUpdater` inner component:
   ```tsx
   function MapBoundsUpdater({ locations }: { locations: ValidLocation[] }) {
     const map = useMap()
     useEffect(() => {
       if (!map || locations.length === 0) return
       const bounds = new google.maps.LatLngBounds()
       locations.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }))
       map.fitBounds(bounds, { padding: 50 })
     }, [map, locations])
     return null
   }
   ```

3. **Pin styling:**
   - Default: `background="#0d9488"` (teal-600), `glyphColor="white"`, `scale={1}`
   - Hovered: `background="#0f766e"` (teal-700), `scale={1.3}`, `borderColor="white"`

4. **InfoWindow** — show on pin click, display:
   - Listing title (from `listings` prop, matched by listingId)
   - Price formatted as VND
   - Link to `/room/{listingId}`

5. **Empty state:**
   ```tsx
   if (validLocations.length === 0) {
     return (
       <div className={`flex items-center justify-center bg-stone-50 rounded-xl text-sm text-stone-400 ${className}`}>
         No map data available
       </div>
     )
   }
   ```

6. **Default center** (Ho Chi Minh City): `{ lat: 10.8231, lng: 106.6297 }` — used only as fallback before fitBounds runs.

7. **Missing API key guard:**
   ```tsx
   const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   if (!apiKey) {
     return <div className="...">Map unavailable (API key not configured)</div>
   }
   ```

### Step 4: Verify compilation

```bash
cd frontend && npx tsc --noEmit
```

Fix any type errors.

## Todo List

- [ ] Install `@vis.gl/react-google-maps`
- [ ] Add env var placeholder to `.env.local`
- [ ] Create `search-map.tsx` with all features
- [ ] Filter locations missing lat/lng
- [ ] Implement auto-fit bounds
- [ ] Implement pin click → InfoWindow
- [ ] Implement hover highlight via props
- [ ] Handle empty state and missing API key
- [ ] Run `npx tsc --noEmit` — 0 errors

## Success Criteria

- `SearchMap` renders with valid locations showing teal pins
- InfoWindow opens on click with listing details
- Hovered pin visually distinct (scaled, darker)
- Map bounds auto-fit to all pins
- No TypeScript errors
- Component under 200 lines
- Graceful fallback when API key missing or no locations

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| `@vis.gl/react-google-maps` incompatible with React 19 | Fallback: use `@googlemaps/js-api-loader` to load Maps JS API, render map in a `useRef` div manually. More code but no React version dep. |
| `AdvancedMarker` requires Map ID (cloud-based map) | If needed, create a Map ID in Google Cloud Console or fall back to regular `Marker` (deprecated but functional) |
| Large number of pins causing perf issues | Unlikely for HMSS scale (<100 listings). If needed, add simple viewport-based filtering later |

## Security Considerations

- API key exposed client-side via `NEXT_PUBLIC_` prefix — restrict key in Google Cloud Console to:
  - Maps JavaScript API only
  - HTTP referrer restrictions (production domain + localhost)
- Never log or display the API key in UI

## Next Steps

After this phase: proceed to [Phase 02](./phase-02-search-page-integration.md) to wire SearchMap into the search page layout.
