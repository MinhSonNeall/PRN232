import { apiRequest } from './api-client'
import type { ChatMessageDto, ConversationListItemDto } from '@/types/chat'

export const chatApi = {
  // Legacy request-scoped history
  getHistory: (requestId: string) =>
    apiRequest<ChatMessageDto[]>(`/api/chat/${requestId}/history`),

  // Conversation-based endpoints
  getConversations: () =>
    apiRequest<ConversationListItemDto[]>('/api/chat/conversations'),

  getConversationHistory: (conversationId: string) =>
    apiRequest<ChatMessageDto[]>(`/api/chat/conversations/${conversationId}/history`),

  startConversation: (otherPartyId: string) =>
    apiRequest<{ conversationId: string }>('/api/chat/conversations/start', {
      method: 'POST',
      body: JSON.stringify({ otherPartyId }),
    }),

  /** Find or create a conversation for a rental request (bridges legacy chat) */
  getConversationForRequest: (requestId: string) =>
    apiRequest<{ conversationId: string }>(`/api/chat/conversations/from-request/${requestId}`, {
      method: 'POST',
    }),
}
