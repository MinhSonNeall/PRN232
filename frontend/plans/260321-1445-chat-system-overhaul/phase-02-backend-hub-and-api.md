# Phase 2: Backend - Hub & API Overhaul

## Priority: P1 | Status: pending

## Overview

Update `ChatHub` and `ChatController` to support conversation-based messaging. Add endpoints for conversation list, creating direct conversations, and owner categorization.

## Key Insights

- Current hub methods use `requestId` as group key
- Auth checks resolve owner via request -> listing -> property chain
- For direct chats, auth is simpler: check caller is OwnerId or TenantId of conversation
- Owner categorization needs: tenant info + their request status (if any) per conversation
- RoomDetailDto does NOT include ownerId -- need to add it or create a separate endpoint

## Related Code Files

### Modify
- `backend/Hmss.Api/Hubs/ChatHub.cs` -- add conversation-based methods
- `backend/Hmss.Api/Controllers/ChatController.cs` -- add conversation endpoints
- `backend/Hmss.Api/Controllers/ViewRoomController.cs` -- add ownerId to RoomDetailDto
- `backend/Hmss.Api/DTOs/Room/RoomDetailDto.cs` -- add OwnerId field

### Create
- `backend/Hmss.Api/DTOs/Chat/ConversationListDto.cs`
- `backend/Hmss.Api/DTOs/Chat/StartConversationDto.cs`

## Implementation Steps

### ChatHub Changes

1. Add new hub method: `JoinConversation(string conversationId)`
   - Validate conversationId format
   - Load conversation, check caller is Owner or Tenant
   - Add to SignalR group keyed by conversationId
2. Add new hub method: `SendConversationMessage(string conversationId, string body)`
   - Auth check (caller is participant)
   - Create ChatMessage with ConversationId
   - Broadcast to group
3. **Keep existing** `JoinChat(requestId)` and `SendMessage(requestId, body)` -- backward compat for request detail pages. Internally, look up/create conversation and delegate.

### ChatController Changes

4. `GET /api/chat/conversations` -- list caller's conversations
   - If role=Owner: return conversations with tenant info + categorization
   - If role=Tenant: return conversations with owner info
   - Response: `ConversationListDto[]`
5. `GET /api/chat/conversations/{conversationId}/history` -- message history
   - Auth: caller must be participant
6. `POST /api/chat/conversations/start` -- create/find direct conversation
   - Body: `{ ownerId: Guid }` (tenant initiates) or `{ tenantId: Guid }` (owner initiates)
   - Uses `FindOrCreateAsync` -- idempotent
   - Returns the `ConversationDto`
7. Keep `GET /api/chat/{requestId}/history` for backward compat

### Owner Categorization Logic

8. In the conversations list endpoint for owners, join with RentalRequest data:
   - **No request**: Tenant has no RentalRequest with any of owner's listings -> "Inquiries" category
   - **Pending request**: Has a request with status=Pending -> "Pending Requests"
   - **Accepted**: Has request with status=Accepted -> "Current Tenants"
   - This is a read-side concern; compute in the query/DTO mapping, not stored

### Room Detail Enhancement

9. Add `OwnerId` to `RoomDetailDto` and `ViewRoomController.GetRoomDetails()`
   - Needed so tenant can call `POST /api/chat/conversations/start { ownerId }` from room page

## ConversationListDto Shape

```csharp
public class ConversationListItemDto
{
    public Guid ConversationId { get; set; }
    public Guid OtherPartyId { get; set; }
    public string OtherPartyName { get; set; }
    public Guid? RequestId { get; set; }
    public string? RequestStatus { get; set; }
    public string? ListingTitle { get; set; }
    public string? LastMessageBody { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public string Category { get; set; } // "Inquiry" | "PendingRequest" | "CurrentTenant"
}
```

## Success Criteria

- [ ] New hub methods work for direct conversation messaging
- [ ] Old hub methods still work for request-scoped chat
- [ ] Conversations list endpoint returns categorized data for owners
- [ ] Start conversation endpoint is idempotent
- [ ] RoomDetailDto includes OwnerId

## Security Considerations

- All endpoints require `[Authorize]`
- Participant check on every hub method and history endpoint
- `POST /conversations/start` validates that ownerId refers to an actual Owner-role user
- Tenants cannot impersonate owners and vice versa
