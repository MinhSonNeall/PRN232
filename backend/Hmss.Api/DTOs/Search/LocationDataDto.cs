namespace Hmss.Api.DTOs.Search;
public class LocationDataDto
{
    public Guid ListingId { get; set; }
    public double? Lat { get; set; }
    public double? Lng { get; set; }
    public string? MapUrl { get; set; }
}
