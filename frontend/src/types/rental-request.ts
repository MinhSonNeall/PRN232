export interface RentalRequestDto {
  listingId: string
  moveInDate: string
  expectedRentalDuration: number
  occupantCount: number
  occupationCategory?: string
  isRoommateWanted?: boolean
  budgetExpectation?: number
  contactPhone: string
  preferredContactMethod: string
  specialNotes?: string
}

export interface RentalRequestSummaryDto {
  requestId: string
  listingTitle: string
  moveInDate: string
  status: 'Pending' | 'Accepted' | 'Rejected' | 'CancelledByTenant' | 'RevokedByOwner'
  submittedAt: string
  availableActions: string[]
}

export interface RequestDetailDto {
  requestId: string
  listingId: string
  listingTitle: string
  moveInDate: string
  expectedRentalDuration: number
  occupantCount: number
  occupationCategory?: string
  isRoommateWanted?: boolean
  budgetExpectation?: number
  contactPhone: string
  preferredContactMethod: string
  specialNotes?: string
  status: string
  submittedAt: string
  decidedAt?: string
  /** Populated by backend — name of the listing owner (for tenant view) */
  ownerName?: string
  /** Populated by backend — name of the tenant who submitted (for owner view) */
  tenantName?: string
}

export interface EligibilityResponseDto {
  eligible: boolean
  reason?: string
}

export interface SubmissionResponseDto {
  requestId: string
  status: string
  message: string
}
