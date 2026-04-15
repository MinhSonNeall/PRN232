# Phase Implementation Report

## Executed Phase
- Phase: phase-01-backend-db-entity + phase-02-backend-signalr-hub
- Plan: /mnt/c/Users/pgb31/hmss-app/frontend/plans/260320-1526-realtime-chat-owner-tenant
- Status: completed

## Files Modified

| File | Action | Notes |
|------|--------|-------|
| `Entities/ChatMessage.cs` | Created | Entity with factory method, 2000-char guard |
| `Repositories/Interfaces/IChatMessageRepository.cs` | Created | SaveAsync + FindByRequestIdAsync(limit=50) |
| `Repositories/Implementations/ChatMessageRepository.cs` | Created | EF Core, eager-loads Sender, descending-take-ascending pattern |
| `Data/HmssDbContext.cs` | Modified | Added DbSet<ChatMessage>, OnModelCreating config (keys, FK NoAction, composite index) |
| `Repositories/Interfaces/IRentalRequestRepository.cs` | Modified | Added FindByIdWithPropertyAsync — includes Listing.Property for OwnerId resolution |
| `Repositories/Implementations/RentalRequestRepository.cs` | Modified | Implemented FindByIdWithPropertyAsync with ThenInclude(Property) |
| `DTOs/Chat/ChatMessageDto.cs` | Created | Record: MessageId, SenderId, SenderName, Body, SentAt |
| `Hubs/ChatHub.cs` | Created | [Authorize] hub, JoinChat + SendMessage, AuthorizeAccess checks tenant/owner |
| `Controllers/ChatController.cs` | Created | GET /api/chat/{requestId}/history, participant check, returns last 50 |
| `Program.cs` | Modified | Added SignalR, ChatMessageRepository DI, CORS AllowCredentials, JWT WebSocket events, MapHub |

## Tasks Completed

- [x] ChatMessage entity with Create factory method
- [x] IChatMessageRepository interface
- [x] ChatMessageRepository EF Core implementation
- [x] HmssDbContext — DbSet + model config
- [x] FindByIdWithPropertyAsync added to IRentalRequestRepository + implementation
- [x] ChatMessageDto record
- [x] ChatHub with JoinChat, SendMessage, AuthorizeAccess
- [x] ChatController GET history endpoint
- [x] Program.cs — SignalR, CORS AllowCredentials, JWT query-string events, hub mapping

## Tests Status
- Type check: pass (dotnet build)
- Unit tests: n/a (no test project in scope)
- Build: **0 errors, 7 warnings** (all pre-existing HasCheckConstraint deprecation warnings)

## Issues Encountered

**Plan correction — nav property path:** Plan referenced `request.Request?.Property?.OwnerId` which doesn't exist. Correct path is `request.Listing?.Property?.OwnerId`. Fixed in both ChatHub and ChatController.

**FindByIdAsync missing ThenInclude:** Existing `FindByIdAsync` only includes `Listing`, not `Listing.Property`. Added `FindByIdWithPropertyAsync` as a non-breaking addition rather than modifying existing method (other callers don't need Property).

**JWT WebSocket token:** Added `JwtBearerEvents.OnMessageReceived` to read `access_token` from query string for SignalR WebSocket connections — required since WebSocket upgrade can't carry Authorization header.

## Next Steps
- Run EF migration: `dotnet ef migrations add AddChatMessages && dotnet ef database update`
- Frontend: implement SignalR client with `@microsoft/signalr`, connect to `/hub/chat` with JWT in query string
