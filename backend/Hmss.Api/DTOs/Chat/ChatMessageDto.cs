namespace Hmss.Api.DTOs.Chat;

/// <summary>
/// Read model returned to clients for a single chat message.
/// </summary>
public record ChatMessageDto(
    Guid     MessageId,
    Guid     SenderId,
    string   SenderName,
    string   Body,
    DateTime SentAt
);
