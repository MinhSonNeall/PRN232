namespace Hmss.Api.DTOs.Admin;
public class UserAccountDetailResponseDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string AccountStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<string> AvailableActions { get; set; } = new();
}
