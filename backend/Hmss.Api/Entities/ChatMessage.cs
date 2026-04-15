namespace Hmss.Api.Entities;

/// <summary>
/// Represents a single chat message. May be scoped to a rental request
/// or to a Conversation (new model). ConversationId is nullable for
/// migration compatibility with pre-existing request-scoped messages.
/// </summary>
public class ChatMessage
{
    public Guid MessageId  { get; private set; }
    public Guid? RequestId { get; private set; }  // nullable — conversation-only messages have no request
    public Guid SenderId   { get; private set; }
    public string Body     { get; private set; } = string.Empty;
    public DateTime SentAt { get; private set; }

    // Conversation FK — nullable for backward compatibility with existing messages
    public Guid? ConversationId { get; private set; }

    // Navigation properties
    public RentalRequest Request      { get; private set; } = null!;
    public UserAccount   Sender       { get; private set; } = null!;
    public Conversation? Conversation { get; private set; }

    private ChatMessage() { }  // EF Core

    /// <summary>
    /// Create a message scoped to a rental request (backward compat).
    /// </summary>
    public static ChatMessage Create(Guid requestId, Guid senderId, string body,
        Guid? conversationId = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(body);
        if (body.Length > 2000) throw new ArgumentException("Message body exceeds 2000 characters");

        return new ChatMessage
        {
            MessageId      = Guid.NewGuid(),
            RequestId      = requestId,
            SenderId       = senderId,
            Body           = body.Trim(),
            SentAt         = DateTime.UtcNow,
            ConversationId = conversationId
        };
    }

    /// <summary>
    /// Create a message scoped to a conversation (direct or request-linked).
    /// </summary>
    public static ChatMessage CreateForConversation(Guid conversationId, Guid senderId, string body)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(body);
        if (body.Length > 2000) throw new ArgumentException("Message body exceeds 2000 characters");

        return new ChatMessage
        {
            MessageId      = Guid.NewGuid(),
            ConversationId = conversationId,
            SenderId       = senderId,
            Body           = body.Trim(),
            SentAt         = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Backfill helper — assigns a conversation to a pre-existing message
    /// that was created before the Conversation entity existed.
    /// </summary>
    public void SetConversationId(Guid conversationId)
    {
        ConversationId = conversationId;
    }
}
