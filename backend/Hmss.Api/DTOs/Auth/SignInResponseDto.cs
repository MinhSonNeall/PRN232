namespace Hmss.Api.DTOs.Auth;
public class SignInResponseDto
{
    public string Token { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    /// <summary>When true, client must call /api/auth/verify-code before receiving a token.</summary>
    public bool RequiresVerification { get; set; }
}
