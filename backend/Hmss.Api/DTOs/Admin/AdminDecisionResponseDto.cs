namespace Hmss.Api.DTOs.Admin;
public class AdminDecisionResponseDto
{
    public Guid Id { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
