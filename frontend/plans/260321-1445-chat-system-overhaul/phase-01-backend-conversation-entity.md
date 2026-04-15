# Phase 1: Backend - Conversation Entity & Migration

## Priority: P1 | Status: pending

## Overview

Create a `Conversation` entity to decouple chat from `RentalRequest`. Migrate existing request-scoped chats into conversations.

## Key Insights

- Current `ChatMessage.RequestId` is the only conversation key
- `RentalRequest` statuses: Pending, Accepted, Rejected, CancelledByTenant, RevokedByOwner
- Owner is resolved via `RentalRequest -> Listing -> Property -> OwnerId`
- Need a way to identify owner for direct chats (no request exists)

## Architecture

```
Conversation
  ConversationId  (PK, Guid)
  OwnerId         (FK -> UserAccount)
  TenantId        (FK -> UserAccount)
  RequestId       (FK -> RentalRequest, nullable)  -- null = direct chat
  CreatedAt       (DateTime)

ChatMessage  (modified)
  MessageId       (PK)
  ConversationId  (FK -> Conversation)  -- NEW, replaces RequestId
  RequestId       (FK, nullable)        -- KEEP for backward compat during migration, then drop
  SenderId        (FK -> UserAccount)
  Body            (string)
  SentAt          (DateTime)
```

**Unique constraint**: `(OwnerId, TenantId, RequestId)` -- one conversation per owner-tenant pair per request (or one direct conversation per pair when RequestId is null).

## Related Code Files

### Modify
- `backend/Hmss.Api/Entities/ChatMessage.cs` -- add ConversationId
- `backend/Hmss.Api/Data/HmssDbContext.cs` -- add Conversation DbSet, configure relationships
- `backend/Hmss.Api/Repositories/Interfaces/IChatMessageRepository.cs` -- add FindByConversationIdAsync
- `backend/Hmss.Api/Repositories/Implementations/ChatMessageRepository.cs` -- implement new query

### Create
- `backend/Hmss.Api/Entities/Conversation.cs`
- `backend/Hmss.Api/Repositories/Interfaces/IConversationRepository.cs`
- `backend/Hmss.Api/Repositories/Implementations/ConversationRepository.cs`
- `backend/Hmss.Api/DTOs/Chat/ConversationDto.cs`
- EF Migration (auto-generated)

## Implementation Steps

1. Create `Conversation` entity with `ConversationId`, `OwnerId`, `TenantId`, `RequestId?`, `CreatedAt`
   - Factory method: `Create(ownerId, tenantId, requestId?)`
   - Navigation props: Owner, Tenant, Request
2. Add `ConversationId` property to `ChatMessage` entity
   - Keep `RequestId` temporarily for migration
3. Configure in `HmssDbContext`:
   - `Conversation` table with unique index on `(OwnerId, TenantId, RequestId)`
   - Update `ChatMessage` to have FK to `Conversation`
   - Index on `(ConversationId, SentAt)`
4. Create `IConversationRepository` with:
   - `FindByIdAsync(Guid conversationId)`
   - `FindOrCreateAsync(Guid ownerId, Guid tenantId, Guid? requestId)` -- upsert pattern
   - `FindByOwnerIdAsync(Guid ownerId)` -- for owner chat page
   - `FindByTenantIdAsync(Guid tenantId)` -- for tenant chat page
   - `FindByParticipantAsync(Guid userId)` -- for floating chat
5. Create `ConversationDto`:
   - ConversationId, OwnerId, OwnerName, TenantId, TenantName, RequestId?, RequestStatus?, LastMessage?, LastMessageAt?, UnreadCount?
6. Update `IChatMessageRepository`:
   - Add `FindByConversationIdAsync(Guid conversationId, int limit)`
7. Register repositories in DI
8. Generate & apply EF migration
9. Create data migration to backfill: for each existing ChatMessage grouped by RequestId, create a Conversation and set ConversationId

## Success Criteria

- [ ] Conversation entity created with proper constraints
- [ ] Migration runs without data loss
- [ ] Existing request-scoped messages linked to auto-created conversations
- [ ] Repository methods compile and pass basic queries

## Risk Assessment

- **Data migration complexity**: Existing messages need ConversationId backfill. Mitigate with SQL data migration in the EF migration itself.
- **OwnerId resolution for backfill**: Must join ChatMessage -> RentalRequest -> Listing -> Property to get OwnerId. Query exists in `FindByIdWithPropertyAsync`.
