namespace Hmss.Api.DTOs.Listing;
public class ListingResponseDto
{
    public Guid ListingId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid PropertyId { get; set; }
    public string Message { get; set; } = string.Empty;
}
