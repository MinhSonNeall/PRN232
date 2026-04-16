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

        if (request.OccupantCount < 1)
            return new ValidationResult(false, new() { "Occupant count must be at least 1" });

        if (request.OccupantCount > listing.Capacity)
            return new ValidationResult(false, new() { $"This room can only accommodate up to {listing.Capacity} occupant(s)" });

        if (listing.Capacity > 1 && request.OccupantCount == 1)
            return new ValidationResult(false, new() { "This is a shared room for 2 or more people. If you are the only tenant, please choose a single room instead." });

        return new ValidationResult(true, new());
    }

    public async Task<ValidationResult> ValidateRequestabilityWithDuplicateCheckAsync(RoomListing listing, Guid tenantId, int occupantCount = 1)
    {
        if (listing.Status != "PublishedAvailable")
            return new ValidationResult(false, new() { "This listing is not available for rental requests" });

        if (occupantCount < 1)
            return new ValidationResult(false, new() { "Occupant count must be at least 1" });

        if (occupantCount > listing.Capacity)
            return new ValidationResult(false, new() { $"This room can only accommodate up to {listing.Capacity} occupant(s)" });

        if (listing.Capacity > 1 && occupantCount == 1)
            return new ValidationResult(false, new() { "This is a shared room for 2 or more people. If you are the only tenant, please choose a single room instead." });

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
