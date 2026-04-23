namespace Hmss.Api.DTOs.Review;
public class RequestSummaryDto
{
    public Guid RequestId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public DateOnly MoveInDate { get; set; }
    public bool IsRoommateWanted { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public string ContactPhone { get; set; } = string.Empty;
    public string? SpecialNotes { get; set; }
    public string ListingTitle { get; set; } = string.Empty;
    public string PropertyName { get; set; } = string.Empty;
    public Guid ListingId { get; set; }
}
