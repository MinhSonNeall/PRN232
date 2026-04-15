// Chat message DTO matching the backend ChatMessageDto
export interface ChatMessageDto {
  messageId: string
  senderId: string
  senderName: string
  body: string
  sentAt: string
}

// Conversation list item matching backend ConversationListItemDto
export interface ConversationListItemDto {
  conversationId: string
  otherPartyId: string
  otherPartyName: string
  requestId?: string
  requestStatus?: string
  listingTitle?: string
  lastMessageBody?: string
  lastMessageAt?: string
  category: 'Inquiry' | 'PendingRequest' | 'CurrentTenant'
}
