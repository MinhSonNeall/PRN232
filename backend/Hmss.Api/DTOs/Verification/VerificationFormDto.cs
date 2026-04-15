namespace Hmss.Api.DTOs.Verification;
public class VerificationFormDto
{
    public string CurrentStatus { get; set; } = "Unverified";
    public string Instructions { get; set; } = "Upload your ID document and any supporting documents for verification.";
}
