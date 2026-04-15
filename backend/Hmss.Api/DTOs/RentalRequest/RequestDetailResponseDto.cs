namespace Hmss.Api.DTOs.RentalRequest;
public class RequestDetailResponseDto
{
    public Guid RequestId { get; set; }
    public Guid ListingId { get; set; }
    public string ListingTitle { get; set; } = string.Empty;
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
    public DateTime? DecidedAt { get; set; }
    /** Owner's full name — used in chat header on tenant's side */
    public string OwnerName { get; set; } = string.Empty;
}
