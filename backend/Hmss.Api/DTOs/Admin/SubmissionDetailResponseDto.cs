namespace Hmss.Api.DTOs.Admin;
public class SubmissionDetailResponseDto
{
    public Guid VerificationId { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string? PersonalInformation { get; set; }
    public string IdDocumentRef { get; set; } = string.Empty;
    public List<string> DocumentUrls { get; set; } = new();
    public string Status { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public string? ReviewNote { get; set; }
}
