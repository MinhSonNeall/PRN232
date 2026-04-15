# Phase 03: Testing & Validation

## Context

- [plan.md](./plan.md)
- [Phase 01](./phase-01-frontend-setup.md), [Phase 02](./phase-02-search-page-integration.md)

## Overview

- **Priority:** P1
- **Status:** pending (blocked by Phase 02)
- **Effort:** 0.5h
- **Description:** Validate all map features work correctly; ensure no regressions

## Related Code Files

### Verify (no modifications)
- `frontend/src/components/shared/search-map.tsx`
- `frontend/src/app/(visitor)/search/page.tsx`
- `frontend/src/app/(visitor)/search/ListingCard.tsx`

## Implementation Steps

### Step 1: TypeScript compilation

```bash
cd frontend && npx tsc --noEmit
```

**Pass criteria:** 0 errors, 0 warnings related to map code.

### Step 2: Production build

```bash
cd frontend && npm run build
```

**Pass criteria:** Build succeeds. Check bundle size — `@vis.gl/react-google-maps` should appear in chunks, not bloating main bundle (Next.js code-splits `'use client'` components).

### Step 3: Lint check

```bash
cd frontend && npm run lint
```

**Pass criteria:** No new lint errors in modified/created files.

### Step 4: Manual test checklist

Run dev server: `cd frontend && npm run dev`

#### Map Rendering
- [ ] Navigate to `/search` — map panel visible on desktop right side
- [ ] Pins appear for listings that have geocoded locations
- [ ] Pins are teal-colored, matching app theme
- [ ] Map auto-zooms to fit all pins

#### Pin Interaction
- [ ] Click pin → InfoWindow opens with listing title, price, "View" link
- [ ] Click "View" in InfoWindow → navigates to `/room/{listingId}`
- [ ] Click another pin → previous InfoWindow closes, new one opens
- [ ] Click map background → InfoWindow closes

#### Card-Pin Hover Sync
- [ ] Hover listing card → corresponding pin scales up / changes shade
- [ ] Stop hovering card → pin returns to default
- [ ] Hover pin on map → corresponding card gets teal ring highlight
- [ ] Stop hovering pin → card ring disappears

#### Filtering
- [ ] Type in location filter → pins update to show only matching listings
- [ ] Change price range → pins update
- [ ] Clear all filters → all pins reappear
- [ ] Server-side search (click "Search Rooms") → pins update with new results

#### Pin Click → Scroll to Card
- [ ] Click a pin when corresponding card is below viewport → page scrolls to card smoothly

#### Mobile (resize browser to <1024px or use devtools)
- [ ] "List" and "Map" tabs appear above results
- [ ] Default tab is "List" — card grid shows, map hidden
- [ ] Tap "Map" → map shows full width, cards hidden
- [ ] Tap "List" → back to cards
- [ ] Pins and interactions work same as desktop in "Map" tab

#### Edge Cases
- [ ] Remove `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` from `.env.local` → map shows "Map unavailable" message, no JS error in console
- [ ] If 0 listings have location data → map shows "No map data available" placeholder
- [ ] Page loads correctly when backend returns empty `locationData: []`
- [ ] Rapid filter changes don't cause map errors or stale pins

#### No Regressions
- [ ] Search form still works identically (all filters, clear, submit)
- [ ] Listing cards still navigate to room detail on click
- [ ] Loading spinner shows during initial load
- [ ] Error state (backend down) still displays retry option
- [ ] "No rooms found" message still appears when filters match nothing

## Success Criteria

- `npx tsc --noEmit` — 0 errors
- `npm run build` — 0 errors
- `npm run lint` — 0 new errors
- All manual test items checked
- No console errors/warnings related to Google Maps or React keys
- Map does not cause layout shift on page load

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Google Maps quota exceeded during testing | Use dev key with daily limit; test with small dataset |
| `AdvancedMarker` needs Map ID not configured | Create basic Map ID in Cloud Console or fall back to standard markers |
| InfoWindow content flickers on rapid hover | Debounce hover state with 100ms delay if observed |

## Next Steps

After all checks pass:
1. Commit changes with message: `feat: add interactive Google Maps to search page`
2. Update `docs/project-changelog.md` with new feature entry
3. Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is documented in deployment guide
