---
title: "Google Maps on Search Page"
description: "Add interactive map with listing pins to the search results page"
status: pending
priority: P2
effort: 4h
branch: TBD
tags: [maps, search, frontend, google-maps]
created: 2026-03-20
---

# Google Maps on Search Page

## Goal

Display an interactive Google Map alongside search results showing listing locations as pins. Desktop uses split-view (list + map); mobile uses tab toggle.

## Current State

- Backend already returns `locationData: LocationDataDto[]` from both search endpoints
- `page.tsx` fetches but **discards** `locationData` (only uses `summaries`)
- No map library installed; room detail page uses iframe embed only
- Types `LocationDataDto`, `SearchPageResponseDto`, `SearchResponseDto` already defined

## Architecture

```
@vis.gl/react-google-maps
    |
    v
SearchMap.tsx (new) --- receives LocationDataDto[] + hover state
    |
    v
page.tsx (modified) --- split layout, stores locationData + hoveredId
    |
    v
ListingCard.tsx (modified) --- emits hover events, highlight ring
```

## Phases

| # | Phase | Effort | Status | File |
|---|-------|--------|--------|------|
| 1 | Setup + SearchMap component | 2h | pending | [phase-01](./phase-01-frontend-setup.md) |
| 2 | Search page integration | 1.5h | pending | [phase-02](./phase-02-search-page-integration.md) |
| 3 | Testing & validation | 0.5h | pending | [phase-03](./phase-03-testing.md) |

## Key Dependencies

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` env var (Maps JavaScript API enabled)
- `@vis.gl/react-google-maps` npm package (must support React 19)
- Backend geocoding already operational

## Out of Scope (YAGNI)

- Marker clustering, map-driven re-search, street view, drawing tools
- Custom map styling beyond default + teal pins
- Server-side map rendering / SSR of map component
