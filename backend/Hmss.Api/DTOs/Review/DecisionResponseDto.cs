namespace Hmss.Api.DTOs.Review;
public class DecisionResponseDto
{
    public Guid RequestId { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
