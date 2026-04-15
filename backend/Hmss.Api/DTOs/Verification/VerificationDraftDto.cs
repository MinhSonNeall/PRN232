namespace Hmss.Api.DTOs.Verification;
public class VerificationDraftDto
{
    public string? PersonalInformation { get; set; }
    public string IdDocumentUrl { get; set; } = string.Empty; // URL after upload
    public List<string>? SupportingDocUrls { get; set; }
}
