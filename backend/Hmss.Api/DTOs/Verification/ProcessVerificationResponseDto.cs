namespace Hmss.Api.DTOs.Verification;
public class ProcessVerificationResponseDto
{
    public List<string> DocumentUrls { get; set; } = new();
    public string PreviewInfo { get; set; } = string.Empty;
}
