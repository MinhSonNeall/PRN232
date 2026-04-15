namespace Hmss.Api.DTOs.Admin;
public class SubmissionSummaryDto
{
    public Guid VerificationId { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public string Status { get; set; } = string.Empty;
}
