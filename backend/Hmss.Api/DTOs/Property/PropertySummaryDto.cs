namespace Hmss.Api.DTOs.Property;
public class PropertySummaryDto
{
    public Guid PropertyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}
