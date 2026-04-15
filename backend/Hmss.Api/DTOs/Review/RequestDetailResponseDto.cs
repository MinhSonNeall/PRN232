namespace Hmss.Api.DTOs.Review;
public class RequestDetailResponseDto
{
    public Guid RequestId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string TenantEmail { get; set; } = string.Empty;
    public string TenantPhone { get; set; } = string.Empty;
    public DateOnly MoveInDate { get; set; }
    public int ExpectedRentalDuration { get; set; }
    public int OccupantCount { get; set; }
    public string? OccupationCategory { get; set; }
    public decimal? BudgetExpectation { get; set; }
    public string ContactPhone { get; set; } = string.Empty;
    public string PreferredContactMethod { get; set; } = string.Empty;
    public string? SpecialNotes { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
}
