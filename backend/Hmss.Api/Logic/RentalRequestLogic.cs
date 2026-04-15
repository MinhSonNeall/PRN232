using Hmss.Api.Entities;
using Hmss.Api.Repositories.Interfaces;

namespace Hmss.Api.Logic;

public class RentalRequestLogic
{
    private readonly IRentalRequestRepository _requestRepo;

    public RentalRequestLogic(IRentalRequestRepository requestRepo)
    {
        _requestRepo = requestRepo;
    }

    public ValidationResult ValidateRequestability(RoomListing listing, DTOs.RentalRequest.RentalRequestDto request)
    {
        if (listing.Status != "PublishedAvailable")
            return new ValidationResult(false, new() { "This listing is not available for rental requests" });
        return new ValidationResult(true, new());
    }

    public async Task<ValidationResult> ValidateRequestabilityWithDuplicateCheckAsync(RoomListing listing, Guid tenantId)
    {
        if (listing.Status != "PublishedAvailable")
            return new ValidationResult(false, new() { "This listing is not available for rental requests" });

        var existing = await _requestRepo.FindByTenantIdAsync(tenantId);
        var hasPending = existing.Any(r => r.ListingId == listing.ListingId && r.Status == "Pending");
        if (hasPending)
            return new ValidationResult(false, new() { "You already have a pending request for this listing" });

        return new ValidationResult(true, new());
    }

    public ValidationResult ValidateCancellationEligibility(RentalRequest request)
    {
        if (request.Status != "Pending")
            return new ValidationResult(false, new() { "Only Pending requests can be cancelled" });
        return new ValidationResult(true, new());
    }
}
