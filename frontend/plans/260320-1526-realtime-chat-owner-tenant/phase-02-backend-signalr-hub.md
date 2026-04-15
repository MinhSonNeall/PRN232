# Phase 2: Backend — SignalR Hub + REST History Endpoint

**Priority:** Critical | **Effort:** 1.5h | **Status:** Complete
**Depends on:** Phase 1

## Overview

Add SignalR `ChatHub` for real-time messaging + a REST endpoint for loading message history on page open.

## Related Code Files

- **Create:** `backend/Hmss.Api/Hubs/ChatHub.cs`
- **Create:** `backend/Hmss.Api/DTOs/Chat/ChatMessageDto.cs`
- **Create:** `backend/Hmss.Api/Controllers/ChatController.cs`
- **Modify:** `backend/Hmss.Api/Program.cs` — register SignalR, map hub, add CORS
- **Modify:** `backend/Hmss.Api/Repositories/ChatMessageRepository.cs` — DI registration

## Architecture

```
Client (Next.js)
  │  WebSocket / SSE / Long-poll
  ▼
SignalR ChatHub  (/hub/chat)
  ├── OnConnectedAsync  → join group "{requestId}"
  ├── SendMessage(requestId, body)
  │     ├── Validate: caller is owner or tenant of request
  │     ├── Save to DB
  │     └── Broadcast to group → ReceiveMessage(dto)
  └── OnDisconnectedAsync → leave group (auto)

REST ChatController (/api/chat/{requestId}/history)
  └── GET → return last 50 messages (for initial page load)
```

## DTOs

```csharp
// ChatMessageDto.cs
public record ChatMessageDto(
    Guid   MessageId,
    Guid   SenderId,
    string SenderName,
    string Body,
    DateTime SentAt
);
```

## ChatHub

```csharp
// ChatHub.cs
[Authorize]
public class ChatHub : Hub
{
    private readonly IChatMessageRepository _chatRepo;
    private readonly IRentalRequestRepository _requestRepo;

    public ChatHub(IChatMessageRepository chatRepo, IRentalRequestRepository requestRepo)
    {
        _chatRepo   = chatRepo;
        _requestRepo = requestRepo;
    }

    // Client calls: connection.invoke("JoinChat", requestId)
    public async Task JoinChat(string requestId)
    {
        var rid = Guid.Parse(requestId);
        await AuthorizeAccess(rid);          // throws HubException if not authorized
        await Groups.AddToGroupAsync(Context.ConnectionId, requestId);
    }

    // Client calls: connection.invoke("SendMessage", requestId, body)
    public async Task SendMessage(string requestId, string body)
    {
        var rid      = Guid.Parse(requestId);
        var senderId = ClaimsHelper.GetUserId(Context.User!);
        await AuthorizeAccess(rid);

        var message = ChatMessage.Create(rid, senderId, body);
        await _chatRepo.SaveAsync(message);

        var dto = new ChatMessageDto(
            message.MessageId,
            message.SenderId,
            Context.User!.Identity!.Name ?? "Unknown",
            message.Body,
            message.SentAt
        );

        // Broadcast to all in the group (including sender for confirmation)
        await Clients.Group(requestId).SendAsync("ReceiveMessage", dto);
    }

    // Validate caller is owner or tenant of the request
    private async Task AuthorizeAccess(Guid requestId)
    {
        var callerId = ClaimsHelper.GetUserId(Context.User!);
        var request  = await _requestRepo.FindByIdAsync(requestId)
            ?? throw new HubException("Request not found");

        bool isParticipant = request.TenantId == callerId
            || request.Request?.Property?.OwnerId == callerId;  // via nav prop

        if (!isParticipant)
            throw new HubException("Access denied");
    }
}
```

## REST History Endpoint

```csharp
// ChatController.cs
[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatMessageRepository _chatRepo;
    private readonly IRentalRequestRepository _requestRepo;

    [HttpGet("{requestId}/history")]
    public async Task<IActionResult> GetHistory(Guid requestId)
    {
        var callerId = ClaimsHelper.GetUserId(User);
        var request  = await _requestRepo.FindByIdAsync(requestId);
        if (request == null) return NotFound();

        // Authorization: only owner or tenant of this request
        bool isParticipant = request.TenantId == callerId
            || request.Request?.Property?.OwnerId == callerId;
        if (!isParticipant) return Forbid();

        var messages = await _chatRepo.FindByRequestIdAsync(requestId, limit: 50);
        var dtos = messages.Select(m => new ChatMessageDto(
            m.MessageId, m.SenderId, m.Sender.FullName, m.Body, m.SentAt
        ));
        return Ok(dtos);
    }
}
```

## Program.cs Changes

```csharp
// Add after existing services:
builder.Services.AddSignalR();
builder.Services.AddScoped<IChatMessageRepository, ChatMessageRepository>();

// In app pipeline (after app.UseAuthorization()):
app.MapHub<ChatHub>("/hub/chat");

// CORS: add AllowCredentials() + specific origin (required for SignalR):
// Change:  .AllowAnyOrigin()
// To:      .WithOrigins("http://localhost:3000").AllowCredentials()
```

> ⚠️ **CORS Critical:** SignalR WebSocket requires `AllowCredentials()` with explicit origin — `AllowAnyOrigin()` is incompatible. Existing CORS policy already has `http://localhost:3000`, just add `.AllowCredentials()`.

## Authorization Flow

1. Client connects with JWT in Authorization header (SignalR client handles this)
2. `[Authorize]` on Hub validates JWT via existing JWT middleware
3. `AuthorizeAccess()` validates caller is participant of the specific request
4. No role restriction — both Tenant and Owner can chat

## Implementation Steps

1. Create `ChatMessageDto.cs`
2. Create `ChatHub.cs` with `JoinChat` + `SendMessage` methods
3. Update `Program.cs`: add SignalR, map hub, fix CORS for credentials
4. Create `ChatController.cs` with history endpoint
5. Register `ChatMessageRepository` in DI
6. Build: `dotnet build` — verify no errors
7. Test hub with Swagger (REST) + browser console (SignalR)

## Security Considerations

- Hub `[Authorize]` blocks unauthenticated connections at connection time
- Per-message `AuthorizeAccess()` prevents cross-request snooping
- Body validated by entity (2000 char max)
- HubException messages are safe to expose to client (no stack traces)

## Success Criteria

- `dotnet build` passes
- `GET /api/chat/{requestId}/history` returns 200 with messages array
- SignalR connection succeeds with valid JWT
- Message sent by owner appears on tenant's client within 1s
