namespace Hmss.Api.DTOs.RentalRequest;
public class CancellationResponseDto
{
    public Guid RequestId { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
