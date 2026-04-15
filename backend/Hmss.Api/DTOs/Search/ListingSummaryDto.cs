namespace Hmss.Api.DTOs.Search;
public class ListingSummaryDto
{
    public Guid ListingId { get; set; }
    public Guid PropertyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Capacity { get; set; }
    public string FurnishedStatus { get; set; } = string.Empty;
    public string? FirstImageUrl { get; set; }
    public string Address { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
