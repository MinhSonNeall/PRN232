namespace Hmss.Api.DTOs.RentalRequest;
public class SubmissionResponseDto
{
    public Guid RequestId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
