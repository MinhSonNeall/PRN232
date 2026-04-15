namespace Hmss.Api.DTOs.Search;

/// <summary>Property with its published room listings for search results</summary>
public class PropertySearchSummaryDto
{
    public Guid PropertyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? FirstImageUrl { get; set; }
    public string? Description { get; set; }
    public int ListingCount { get; set; }
    public List<ListingSummaryDto> Listings { get; set; } = new();
}
