namespace Hmss.Api.DTOs.Listing;
public class RoomListingUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Capacity { get; set; }
    public string? Amenities { get; set; }
    public DateOnly AvailableFrom { get; set; }
    public string FurnishedStatus { get; set; } = string.Empty;
    public string PrivateWCStatus { get; set; } = string.Empty;
    public List<string> ImageUrls { get; set; } = new();
}
