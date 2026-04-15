namespace Hmss.Api.DTOs.Property;
public class PropertyFormResponseDto
{
    public Dictionary<string, string> FieldDescriptions { get; set; } = new()
    {
        ["name"] = "Property name (required)",
        ["address"] = "Full address (required)",
        ["mapLocation"] = "Map location string (optional)",
        ["description"] = "Property description (optional)",
        ["generalPolicies"] = "House rules and policies (optional)"
    };
    // Pre-filled values for edit mode
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? MapLocation { get; set; }
    public string? Description { get; set; }
    public string? GeneralPolicies { get; set; }
    public List<string> ImageUrls { get; set; } = new();
}
