# Phase 3: Frontend - Chat Infrastructure Refactor

## Priority: P1 | Status: pending

## Overview

Refactor `useChat` hook and `chatApi` to support conversation-based messaging while keeping backward compat for request detail pages.

## Key Insights

- `useChat(requestId)` currently: connects SignalR, joins group by requestId, loads history
- New: need `useConversation(conversationId)` that joins by conversationId
- ChatBox component is already generic enough -- just needs the right hook data
- Can make a unified hook that accepts either `requestId` or `conversationId`

## Related Code Files

### Modify
- `frontend/src/hooks/use-chat.ts` -- extend to support conversationId
- `frontend/src/lib/api/chat.ts` -- add conversation API methods
- `frontend/src/types/chat.ts` -- add conversation types
- `frontend/src/components/shared/ChatBox.tsx` -- accept conversationId prop option

### Create
- `frontend/src/hooks/use-conversations.ts` -- hook for loading conversation list

## Implementation Steps

1. **Update types** (`src/types/chat.ts`):
   ```ts
   export interface ConversationDto {
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
   ```

2. **Update chat API** (`src/lib/api/chat.ts`):
   - `getConversations()` -> `GET /api/chat/conversations`
   - `getConversationHistory(conversationId)` -> `GET /api/chat/conversations/{id}/history`
   - `startConversation(ownerId)` -> `POST /api/chat/conversations/start`
   - Keep existing `getHistory(requestId)`

3. **Refactor `useChat` hook**:
   - Accept params: `{ requestId?: string, conversationId?: string }`
   - If conversationId: use `JoinConversation` / `SendConversationMessage` hub methods, load history via conversation endpoint
   - If requestId: use existing `JoinChat` / `SendMessage` methods (backward compat)
   - Same return shape: `{ messages, connected, error, sendMessage }`

4. **Update `ChatBox` component**:
   - Props: `{ requestId?: string, conversationId?: string, otherPartyName: string }`
   - Pass through to useChat

5. **Create `useConversations` hook** (`src/hooks/use-conversations.ts`):
   - Fetches conversation list via `chatApi.getConversations()`
   - Returns `{ conversations, isLoading, error, refresh }`
   - Used by chat pages

6. **Update `RoomDetailDto` type** (`src/types/listing.ts`):
   - Add `ownerId?: string` field

## Success Criteria

- [ ] useChat works with both requestId and conversationId params
- [ ] Existing request detail chat pages unchanged in behavior
- [ ] ChatBox renders identically for both modes
- [ ] useConversations fetches and exposes conversation list

## Risk Assessment

- **Hub connection sharing**: If user has multiple chat windows open (floating + page), each creates a separate SignalR connection. Acceptable for MVP; optimize later with a shared connection manager if needed.
