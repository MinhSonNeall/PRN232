namespace Hmss.Api.Entities;

/// <summary>
/// Represents a conversation thread between an owner and a tenant,
/// optionally scoped to a rental request. Null RequestId = direct chat.
/// </summary>
public class Conversation
{
    public Guid ConversationId { get; private set; }
    public Guid OwnerId { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid? RequestId { get; private set; }  // null = direct chat
    public DateTime CreatedAt { get; private set; }

    // Navigation
    public UserAccount? Owner { get; private set; }
    public UserAccount? Tenant { get; private set; }
    public RentalRequest? Request { get; private set; }

    private Conversation() { }  // EF Core

    public static Conversation Create(Guid ownerId, Guid tenantId, Guid? requestId = null)
    {
        return new Conversation
        {
            ConversationId = Guid.NewGuid(),
            OwnerId = ownerId,
            TenantId = tenantId,
            RequestId = requestId,
            CreatedAt = DateTime.UtcNow
        };
    }
}
