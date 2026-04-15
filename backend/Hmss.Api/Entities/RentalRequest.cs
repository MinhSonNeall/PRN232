namespace Hmss.Api.Entities;

public class RentalRequest
{
    public Guid RequestId { get; private set; }
    public Guid ListingId { get; private set; }
    public Guid TenantId { get; private set; }
    public DateOnly MoveInDate { get; private set; }
    public int ExpectedRentalDuration { get; private set; } // months
    public int OccupantCount { get; private set; }
    public string? OccupationCategory { get; private set; }
    public decimal? BudgetExpectation { get; private set; }
    public string ContactPhone { get; private set; } = string.Empty;
    public string PreferredContactMethod { get; private set; } = string.Empty; // Phone|Email|WhatsApp
    public string? SpecialNotes { get; private set; }
    public string Status { get; private set; } = "Pending"; // Pending|Accepted|Rejected|CancelledByTenant|RevokedByOwner
    public DateTime SubmittedAt { get; private set; }
    public DateTime? DecidedAt { get; private set; }

    // Navigation
    public RoomListing? Listing { get; private set; }
    public UserAccount? Tenant { get; private set; }

    private RentalRequest() { }

    public static RentalRequest Create(Guid listingId, Guid tenantId, DateOnly moveInDate, int expectedRentalDuration,
        int occupantCount, string? occupationCategory, decimal? budgetExpectation, string contactPhone,
        string preferredContactMethod, string? specialNotes)
    {
        return new RentalRequest
        {
            RequestId = Guid.NewGuid(),
            ListingId = listingId,
            TenantId = tenantId,
            MoveInDate = moveInDate,
            ExpectedRentalDuration = expectedRentalDuration,
            OccupantCount = occupantCount,
            OccupationCategory = occupationCategory,
            BudgetExpectation = budgetExpectation,
            ContactPhone = contactPhone,
            PreferredContactMethod = preferredContactMethod,
            SpecialNotes = specialNotes,
            Status = "Pending",
            SubmittedAt = DateTime.UtcNow
        };
    }

    public StatusChangeResult ApplyCancellation()
    {
        if (Status != "Pending")
            return new StatusChangeResult(false, "Only Pending requests can be cancelled");
        Status = "CancelledByTenant";
        DecidedAt = DateTime.UtcNow;
        return new StatusChangeResult(true);
    }

    public StatusChangeResult Accept()
    {
        if (Status != "Pending")
            return new StatusChangeResult(false, "Only Pending requests can be accepted");
        Status = "Accepted";
        DecidedAt = DateTime.UtcNow;
        return new StatusChangeResult(true);
    }

    public StatusChangeResult Reject()
    {
        if (Status != "Pending")
            return new StatusChangeResult(false, "Only Pending requests can be rejected");
        Status = "Rejected";
        DecidedAt = DateTime.UtcNow;
        return new StatusChangeResult(true);
    }

    public StatusChangeResult Revoke()
    {
        if (Status != "Accepted")
            return new StatusChangeResult(false, "Only Accepted requests can be revoked");
        Status = "RevokedByOwner";
        DecidedAt = DateTime.UtcNow;
        return new StatusChangeResult(true);
    }
}
