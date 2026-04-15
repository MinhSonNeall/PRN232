export interface UserAccountSummaryDto {
  userId: string
  fullName: string
  email: string
  role: string
  accountStatus: string
}

export interface UserAccountDetailDto extends UserAccountSummaryDto {
  phone: string
  createdAt: string
  availableActions: string[]
}

export interface ChangeUserAccountStatusResponseDto {
  userId: string
  newStatus: string
  message: string
}

export interface VerificationSummaryDto {
  verificationId: string
  ownerName: string
  submittedAt: string
  status: string
}

export interface VerificationDetailDto {
  verificationId: string
  ownerId: string
  ownerName: string
  personalInformation?: string
  idDocumentRef: string
  supportingDocsRef?: string[]
  status: string
  submittedAt: string
  reviewedAt?: string
  reviewNote?: string
  documentUrls: string[]
}

export interface AdminListingSummaryDto {
  listingId: string
  title: string
  ownerName: string
  price: number
  status: string
  address: string
}
