namespace Hmss.Api.DTOs.Verification;
public class VerificationSubmissionResponseDto
{
    public Guid VerificationId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
