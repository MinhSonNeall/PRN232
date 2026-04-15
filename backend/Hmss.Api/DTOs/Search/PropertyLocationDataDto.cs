namespace Hmss.Api.DTOs.Search;

/// <summary>Map pin data for a property with price range of its rooms</summary>
public class PropertyLocationDataDto
{
    public Guid PropertyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double? Lat { get; set; }
    public double? Lng { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
}
