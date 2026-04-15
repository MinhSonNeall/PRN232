namespace Hmss.Api.DTOs.Listing;
public class VisibilityResponseDto
{
    public Guid ListingId { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<string> AvailableActions { get; set; } = new();
}
