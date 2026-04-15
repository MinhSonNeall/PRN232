namespace Hmss.Api.DTOs.RentalRequest;
public class RentalRequestSummaryDto
{
    public Guid RequestId { get; set; }
    public string ListingTitle { get; set; } = string.Empty;
    public DateOnly MoveInDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public List<string> AvailableActions { get; set; } = new();
}
