using Hmss.Api.DTOs.Verification;
using Hmss.Api.Entities;
namespace Hmss.Api.Logic;
public class VerificationLogic
{
    public ValidationResult ValidateRequiredFields(VerificationDraftDto request)
    {
        if (string.IsNullOrWhiteSpace(request.IdDocumentUrl))
            return new ValidationResult(false, new() { "ID document is required" });
        return new ValidationResult(true, new());
    }

    public ValidationResult ValidateDecision(OwnerVerification verification)
    {
        if (verification.Status != "PendingReview")
            return new ValidationResult(false, new() { "Can only review PendingReview verifications" });
        return new ValidationResult(true, new());
    }
}
