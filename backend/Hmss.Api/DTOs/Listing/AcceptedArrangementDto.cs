namespace Hmss.Api.DTOs.Listing;
public class AcceptedArrangementDto
{
    public Guid RequestId { get; set; }
    public Guid ListingId { get; set; }
    public string ListingTitle { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    public DateOnly MoveInDate { get; set; }
    public DateTime? AcceptedAt { get; set; }
}
