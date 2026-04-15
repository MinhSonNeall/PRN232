namespace Hmss.Api.DTOs.Listing;
public class StatusChangeResponseDto
{
    public Guid Id { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
