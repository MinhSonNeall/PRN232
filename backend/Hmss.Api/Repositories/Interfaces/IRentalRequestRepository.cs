using Hmss.Api.Entities;
namespace Hmss.Api.Repositories.Interfaces;
public interface IRentalRequestRepository
{
    Task<RentalRequest> SaveAsync(RentalRequest entity);
    Task<RentalRequest?> FindByIdAsync(Guid requestId);
    /// <summary>Includes Listing + Listing.Property — needed to resolve OwnerId for chat auth.</summary>
    Task<RentalRequest?> FindByIdWithPropertyAsync(Guid requestId);
    Task<List<RentalRequest>> FindByTenantIdAsync(Guid tenantId);
    Task<List<RentalRequest>> FindByRoomIdAsync(Guid listingId);
    Task<List<RentalRequest>> FindAllByOwnerIdAsync(Guid ownerId);
    Task<List<RentalRequest>> FindAcceptedByOwnerIdAsync(Guid ownerId);
    Task<RentalRequest> UpdateAsync(RentalRequest entity);
    /// <summary>
    /// Finds the most relevant request between an owner and tenant.
    /// Priority: Accepted > Pending > other statuses. Returns null if none.
    /// </summary>
    Task<RentalRequest?> FindBestByOwnerAndTenantAsync(Guid ownerId, Guid tenantId);
}
