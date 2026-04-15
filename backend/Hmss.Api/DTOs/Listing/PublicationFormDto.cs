namespace Hmss.Api.DTOs.Listing;
public class PublicationFormDto
{
    public Guid ListingId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool HasImages { get; set; }
}
