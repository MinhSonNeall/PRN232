namespace Hmss.Api.DTOs.Auth;
public class RegistrationFormResponseDto
{
    public List<string> AvailableRoles { get; set; } = new() { "Tenant", "Owner" };
}
