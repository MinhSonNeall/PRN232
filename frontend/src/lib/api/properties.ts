import { apiRequest } from '@/lib/api/api-client'

export interface PropertyDto {
  name: string
  address: string
  mapLocation?: string
  description?: string
  generalPolicies?: string
  imageUrls?: string[]
}

export interface PropertySummaryDto {
  propertyId: string
  name: string
  address: string
  updatedAt: string
}

export interface PropertyFormResponseDto {
  name: string
  address: string
  mapLocation?: string
  description?: string
  generalPolicies?: string
  imageUrls: string[]
}

export const propertiesApi = {
  getForm: () => apiRequest<{ fieldDescriptions: Record<string, string> }>('/api/property/form'),
  processImages: (formData: FormData) => apiRequest<{ imageUrls: string[] }>('/api/property/process', { method: 'POST', body: formData }),
  createProperty: (data: PropertyDto) => apiRequest<{ propertyId: string; name: string; address: string; createdAt: string }>('/api/property', { method: 'POST', body: JSON.stringify(data) }),
  getMyProperties: () => apiRequest<PropertySummaryDto[]>('/api/property/my'),
  getPropertyForEdit: (id: string) => apiRequest<PropertyFormResponseDto>(`/api/property/${id}/edit`),
  processUpdateImages: (id: string, formData: FormData) => apiRequest<{ imageUrls: string[] }>(`/api/property/${id}/process`, { method: 'POST', body: formData }),
  updateProperty: (id: string, data: PropertyDto) => apiRequest<{ propertyId: string; name: string }>(`/api/property/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}
