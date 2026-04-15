namespace Hmss.Api.DTOs.RentalRequest;
public class RentalRequestFormResponseDto
{
    public Guid ListingId { get; set; }
    public string ListingTitle { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Address { get; set; } = string.Empty;
}
