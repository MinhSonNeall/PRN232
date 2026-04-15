namespace Hmss.Api.DTOs.Chat;

/// <summary>
/// Represents a single row in the conversation inbox list,
/// carrying enough data to render the list item without additional fetches.
/// Category values: Inquiry | PendingRequest | CurrentTenant
/// </summary>
public class ConversationListItemDto
{
    public Guid ConversationId { get; set; }
    public Guid OtherPartyId { get; set; }
    public string OtherPartyName { get; set; } = string.Empty;
    public Guid? RequestId { get; set; }
    public string? RequestStatus { get; set; }
    public string? ListingTitle { get; set; }
    public string? LastMessageBody { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public string Category { get; set; } = "Inquiry"; // Inquiry | PendingRequest | CurrentTenant
}
