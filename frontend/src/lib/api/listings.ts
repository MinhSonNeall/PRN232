import { apiRequest } from '@/lib/api/api-client'
import type {
  SearchCriteriaDto, SearchPageResponseDto, SearchResponseDto,
  RoomDetailDto, MapDto, RoomListingDraftDto, ListingResponseDto,
  PublicationEligibilityDto, AcceptedArrangementDto, PropertyDetailDto
} from '@/types/listing'

export const listingsApi = {
  getSearchPage: () => apiRequest<SearchPageResponseDto>('/api/room-search/page'),
  searchRooms: (criteria: SearchCriteriaDto) => apiRequest<SearchResponseDto>('/api/room-search/search', { method: 'POST', body: JSON.stringify(criteria) }),
  getRoomDetails: (id: string) => apiRequest<RoomDetailDto>(`/api/room/${id}`),
  getMapInformation: (id: string) => apiRequest<MapDto>(`/api/room/${id}/map`),
  getListingForm: (propertyId: string) => apiRequest<{ propertyName: string; propertyAddress: string }>(`/api/listing/form/${propertyId}`),
  processListing: (formData: FormData) => apiRequest<{ imageUrls: string[] }>('/api/listing/process', { method: 'POST', body: formData }),
  saveDraft: (data: RoomListingDraftDto & { imageUrls: string[] }) => apiRequest<ListingResponseDto>('/api/listing', { method: 'POST', body: JSON.stringify(data) }),
  getListingForEdit: (id: string) => apiRequest<ListingResponseDto & { details: RoomListingDraftDto; imageUrls: string[] }>(`/api/listing/${id}/edit`),
  processListingUpdate: (id: string, formData: FormData) => apiRequest<{ imageUrls: string[] }>(`/api/listing/${id}/process`, { method: 'POST', body: formData }),
  updateListing: (id: string, data: object) => apiRequest<ListingResponseDto>(`/api/listing/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPublishCheck: (id: string) => apiRequest<PublicationEligibilityDto>(`/api/listing/${id}/publish-check`),
  publishListing: (id: string) => apiRequest<ListingResponseDto>(`/api/listing/${id}/publish`, { method: 'POST' }),
  getVisibility: (id: string) => apiRequest<{ status: string }>(`/api/listing/${id}/visibility`),
  changeVisibility: (id: string, action: 'Hide' | 'Show') => apiRequest<ListingResponseDto>(`/api/listing/${id}/visibility`, { method: 'POST', body: JSON.stringify({ action }) }),
  getAcceptedArrangements: () => apiRequest<AcceptedArrangementDto[]>('/api/listing/accepted-arrangements'),
  reopenListing: (requestId: string) => apiRequest<ListingResponseDto>(`/api/listing/${requestId}/reopen`, { method: 'POST' }),
  reopenByListing: (listingId: string) => apiRequest<{ id: string; newStatus: string; message: string }>(`/api/listing/reopen-by-listing/${listingId}`, { method: 'POST' }),
  getOwnerListings: () => apiRequest<ListingResponseDto[]>('/api/listing/my'),
  getPropertyDetails: (id: string) => apiRequest<PropertyDetailDto>(`/api/property-view/${id}`),
  getPropertyMap: (id: string) => apiRequest<MapDto>(`/api/property-view/${id}/map`),
}
