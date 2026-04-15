namespace Hmss.Api.DTOs.Auth;
public class VerifyCodeRequestDto
{
    public Guid UserId { get; set; }
    public string Code { get; set; } = string.Empty;
}
