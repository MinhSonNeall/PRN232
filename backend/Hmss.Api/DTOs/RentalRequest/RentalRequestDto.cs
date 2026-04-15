namespace Hmss.Api.DTOs.RentalRequest;
public class RentalRequestDto
{
    public Guid ListingId { get; set; }
    public DateOnly MoveInDate { get; set; }
    public int ExpectedRentalDuration { get; set; }
    public int OccupantCount { get; set; }
    public string? OccupationCategory { get; set; }
    public decimal? BudgetExpectation { get; set; }
    public string ContactPhone { get; set; } = string.Empty;
    public string PreferredContactMethod { get; set; } = string.Empty;
    public string? SpecialNotes { get; set; }
}
