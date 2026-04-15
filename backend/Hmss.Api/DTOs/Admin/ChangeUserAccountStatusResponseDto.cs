namespace Hmss.Api.DTOs.Admin;
public class ChangeUserAccountStatusResponseDto
{
    public Guid UserId { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
