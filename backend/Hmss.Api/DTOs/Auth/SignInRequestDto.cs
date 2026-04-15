namespace Hmss.Api.DTOs.Auth;
public class SignInRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
