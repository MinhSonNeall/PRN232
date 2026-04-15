export interface SearchCriteriaDto {
  location?: string
  minPrice?: number
  maxPrice?: number
  amenities?: string[]
  availableFrom?: string
  furnishedStatus?: string
  privateWC?: boolean
}

export interface ListingSummaryDto {
  listingId: string
  propertyId: string
  title: string
  price: number
  capacity: number
  furnishedStatus: string
  firstImageUrl?: string
  address: string
  status: string
}

export interface PropertySearchSummaryDto {
  propertyId: string
  name: string
  address: string
  firstImageUrl?: string
  description?: string
  listingCount: number
  listings: ListingSummaryDto[]
}

export interface LocationDataDto {
  listingId: string
  lat?: number
  lng?: number
  mapUrl?: string
}

export interface PropertyLocationDataDto {
  propertyId: string
  name: string
  lat?: number
  lng?: number
  minPrice?: number
  maxPrice?: number
}

export interface PropertyDetailDto {
  propertyId: string
  name: string
  address: string
  mapLocation?: string
  description?: string
  generalPolicies?: string
  images: string[]
  listings: ListingSummaryDto[]
}

export interface SearchPageResponseDto {
  summaries: ListingSummaryDto[]
  locationData: LocationDataDto[]
  properties: PropertySearchSummaryDto[]
  propertyLocations: PropertyLocationDataDto[]
}

export interface SearchResponseDto {
  summaries: ListingSummaryDto[]
  locationData: LocationDataDto[]
  properties: PropertySearchSummaryDto[]
  propertyLocations: PropertyLocationDataDto[]
  hasResults: boolean
}

export interface RoomDetailDto {
  listingId: string
  propertyId: string
  ownerId: string
  title: string
  description?: string
  price: number
  capacity: number
  amenities: string[]
  availableFrom: string
  furnishedStatus: string
  privateWCStatus: string
  imagesRef: string[]
  status: string
  propertyName: string
  propertyAddress: string
  propertyPolicies?: string
}

export interface MapDto {
  embedUrl?: string
  lat?: number
  lng?: number
}

export interface RoomListingDraftDto {
  propertyId: string
  title: string
  description?: string
  price: number
  capacity: number
  amenities?: string
  availableFrom: string
  furnishedStatus: string
  privateWCStatus: string
}

export interface ListingResponseDto {
  listingId: string
  title: string
  status: string
  propertyId: string
}

export interface PublicationEligibilityDto {
  eligible: boolean
  blockers: string[]
}

export interface VisibilityActionDto {
  action: 'Hide' | 'Show'
}

export interface AcceptedArrangementDto {
  requestId: string
  listingId: string
  listingTitle: string
  tenantName: string
  moveInDate: string
  acceptedAt: string
}
