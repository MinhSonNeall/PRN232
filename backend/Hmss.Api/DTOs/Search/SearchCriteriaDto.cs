namespace Hmss.Api.DTOs.Search;
public class SearchCriteriaDto
{
    public string? Location { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public List<string>? Amenities { get; set; }
    public DateOnly? AvailableFrom { get; set; }
    public string? FurnishedStatus { get; set; }
    public bool? PrivateWC { get; set; }
}
