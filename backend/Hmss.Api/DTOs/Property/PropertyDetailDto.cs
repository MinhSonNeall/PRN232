using Hmss.Api.DTOs.Search;

namespace Hmss.Api.DTOs.Property;

/// <summary>Public property detail for visitors</summary>
public class PropertyDetailDto
{
    public Guid PropertyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? MapLocation { get; set; }
    public string? Description { get; set; }
    public string? GeneralPolicies { get; set; }
    public List<string> Images { get; set; } = new();
    public List<ListingSummaryDto> Listings { get; set; } = new();
}
