namespace Hmss.Api.Entities;

public class OwnerVerification
{
    public Guid VerificationId { get; private set; }
    public Guid OwnerId { get; private set; }
    public string? PersonalInformation { get; private set; }
    public string IdDocumentRef { get; private set; } = string.Empty;
    public string? SupportingDocsRef { get; private set; } // JSON array
    public string Status { get; private set; } = "PendingReview"; // PendingReview|Verified|Rejected
    public DateTime SubmittedAt { get; private set; }
    public DateTime? ReviewedAt { get; private set; }
    public string? ReviewNote { get; private set; }

    private OwnerVerification() { }

    public static OwnerVerification Create(Guid ownerId, string? personalInformation, string idDocumentRef, string? supportingDocsRef)
    {
        return new OwnerVerification
        {
            VerificationId = Guid.NewGuid(),
            OwnerId = ownerId,
            PersonalInformation = personalInformation,
            IdDocumentRef = idDocumentRef,
            SupportingDocsRef = supportingDocsRef,
            Status = "PendingReview",
            SubmittedAt = DateTime.UtcNow
        };
    }

    public StatusChangeResult Approve(string? reviewNote)
    {
        if (Status != "PendingReview")
            return new StatusChangeResult(false, "Can only approve PendingReview verifications");
        Status = "Verified";
        ReviewedAt = DateTime.UtcNow;
        ReviewNote = reviewNote;
        return new StatusChangeResult(true);
    }

    public StatusChangeResult Reject(string reviewNote)
    {
        if (Status != "PendingReview")
            return new StatusChangeResult(false, "Can only reject PendingReview verifications");
        Status = "Rejected";
        ReviewedAt = DateTime.UtcNow;
        ReviewNote = reviewNote;
        return new StatusChangeResult(true);
    }
}
