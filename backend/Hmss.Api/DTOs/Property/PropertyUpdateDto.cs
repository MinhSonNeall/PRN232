namespace Hmss.Api.DTOs.Property;
public class PropertyUpdateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? MapLocation { get; set; }
    public string? Description { get; set; }
    public string? GeneralPolicies { get; set; }
    public List<string> ImageUrls { get; set; } = new();
}
