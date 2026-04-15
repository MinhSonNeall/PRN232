namespace Hmss.Api.DTOs.Room;
public class RoomDetailDto
{
    public Guid ListingId { get; set; }
    public Guid PropertyId { get; set; }
    public Guid OwnerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Capacity { get; set; }
    public List<string> Amenities { get; set; } = new();
    public DateOnly AvailableFrom { get; set; }
    public string FurnishedStatus { get; set; } = string.Empty;
    public string PrivateWCStatus { get; set; } = string.Empty;
    public List<string> ImagesRef { get; set; } = new();
    public string Status { get; set; } = string.Empty;
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyAddress { get; set; } = string.Empty;
    public string? PropertyPolicies { get; set; }
}
