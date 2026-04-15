namespace Hmss.Api.DTOs.Admin;
public class AdminListingSummaryDto
{
    public Guid ListingId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}
public class AdminListingDetailDto : AdminListingSummaryDto
{
    public string? Description { get; set; }
    public string OwnerEmail { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
}
public class ControlActionDto
{
    public Guid ListingId { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
