# Phase 1: Backend — DB Schema & Entity

**Priority:** Critical | **Effort:** 1h | **Status:** Complete

## Overview

Add `ChatMessages` table and `ChatMessage` entity to persist chat history.

## Related Code Files

- **Create:** `backend/Hmss.Api/Entities/ChatMessage.cs`
- **Create:** `backend/Hmss.Api/Repositories/Interfaces/IChatMessageRepository.cs`
- **Create:** `backend/Hmss.Api/Repositories/ChatMessageRepository.cs`
- **Modify:** `backend/Hmss.Api/Data/HmssDbContext.cs` — add DbSet + config
- **Create:** EF Core migration

## DB Schema

```sql
CREATE TABLE ChatMessages (
    MessageId   UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    RequestId   UNIQUEIDENTIFIER NOT NULL,   -- FK → RentalRequests
    SenderId    UNIQUEIDENTIFIER NOT NULL,   -- FK → UserAccounts
    Body        NVARCHAR(2000) NOT NULL,
    SentAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (RequestId) REFERENCES RentalRequests(RequestId),
    FOREIGN KEY (SenderId)  REFERENCES UserAccounts(UserId)
);
CREATE INDEX IX_ChatMessages_RequestId ON ChatMessages(RequestId, SentAt);
```

## Entity Design

```csharp
// ChatMessage.cs
public class ChatMessage
{
    public Guid MessageId  { get; private set; }
    public Guid RequestId  { get; private set; }  // scoped to rental request
    public Guid SenderId   { get; private set; }
    public string Body     { get; private set; } = string.Empty;
    public DateTime SentAt { get; private set; }

    // Nav props
    public RentalRequest Request { get; private set; } = null!;
    public UserAccount   Sender  { get; private set; } = null!;

    private ChatMessage() { }

    public static ChatMessage Create(Guid requestId, Guid senderId, string body)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(body);
        if (body.Length > 2000) throw new ArgumentException("Message too long");

        return new ChatMessage
        {
            MessageId = Guid.NewGuid(),
            RequestId = requestId,
            SenderId  = senderId,
            Body      = body.Trim(),
            SentAt    = DateTime.UtcNow
        };
    }
}
```

## Repository Interface

```csharp
// IChatMessageRepository.cs
public interface IChatMessageRepository
{
    Task SaveAsync(ChatMessage message);
    Task<List<ChatMessage>> FindByRequestIdAsync(Guid requestId, int limit = 50);
}
```

## DbContext Changes

```csharp
// In HmssDbContext.cs
public DbSet<ChatMessage> ChatMessages { get; set; }

// In OnModelCreating:
modelBuilder.Entity<ChatMessage>(e => {
    e.HasKey(m => m.MessageId);
    e.Property(m => m.Body).HasMaxLength(2000).IsRequired();
    e.HasOne(m => m.Request).WithMany().HasForeignKey(m => m.RequestId).OnDelete(DeleteBehavior.NoAction);
    e.HasOne(m => m.Sender).WithMany().HasForeignKey(m => m.SenderId).OnDelete(DeleteBehavior.NoAction);
    e.HasIndex(m => new { m.RequestId, m.SentAt });
});
```

## Implementation Steps

1. Create `ChatMessage.cs` entity with factory method
2. Create `IChatMessageRepository.cs` interface
3. Create `ChatMessageRepository.cs` implementation (EF Core)
4. Add DbSet + config to `HmssDbContext.cs`
5. Run `dotnet ef migrations add AddChatMessages`
6. Run `dotnet ef database update` to apply

## Security Considerations

- Body max 2000 chars enforced at entity level
- No direct FK cascade delete — chat history preserved if request state changes
- SenderId validated at Hub level (not just at DB) to prevent spoofing

## Success Criteria

- Migration applies without error
- `ChatMessages` table visible in SQL Server
- Repository reads/writes work in isolation test
