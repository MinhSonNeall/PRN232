using Hmss.Api.Data;
using Hmss.Api.Entities;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hmss.Api.Repositories.Implementations;

public class RentalRequestRepository : IRentalRequestRepository
{
    private readonly HmssDbContext _db;
    public RentalRequestRepository(HmssDbContext db) => _db = db;

    public async Task<RentalRequest> SaveAsync(RentalRequest entity)
    {
        _db.RentalRequests.Add(entity);
        await _db.SaveChangesAsync();
        return entity;
    }

    public async Task<RentalRequest?> FindByIdAsync(Guid requestId) =>
        await _db.RentalRequests.Include(x => x.Listing).Include(x => x.Tenant)
            .FirstOrDefaultAsync(x => x.RequestId == requestId);

    public async Task<RentalRequest?> FindByIdWithPropertyAsync(Guid requestId) =>
        await _db.RentalRequests
            .Include(x => x.Listing).ThenInclude(l => l!.Property)
            .Include(x => x.Tenant)
            .FirstOrDefaultAsync(x => x.RequestId == requestId);

    public async Task<List<RentalRequest>> FindByTenantIdAsync(Guid tenantId) =>
        await _db.RentalRequests.Include(x => x.Listing)
            .Where(x => x.TenantId == tenantId).OrderByDescending(x => x.SubmittedAt).ToListAsync();

    public async Task<List<RentalRequest>> FindByRoomIdAsync(Guid listingId) =>
        await _db.RentalRequests.Include(x => x.Tenant)
            .Include(x => x.Listing).ThenInclude(l => l!.Property)
            .Where(x => x.ListingId == listingId).OrderByDescending(x => x.SubmittedAt).ToListAsync();

    public async Task<List<RentalRequest>> FindAllByOwnerIdAsync(Guid ownerId) =>
        await _db.RentalRequests
            .Include(x => x.Tenant)
            .Include(x => x.Listing).ThenInclude(l => l!.Property)
            .Where(x => x.Listing!.Property!.OwnerId == ownerId)
            .OrderByDescending(x => x.SubmittedAt)
            .ToListAsync();

    public async Task<List<RentalRequest>> FindAcceptedByOwnerIdAsync(Guid ownerId) =>
        await _db.RentalRequests
            .Include(x => x.Listing).ThenInclude(l => l!.Property)
            .Include(x => x.Tenant)
            .Where(x => x.Status == "Accepted" && x.Listing!.Property!.OwnerId == ownerId)
            .ToListAsync();

    public async Task<RentalRequest> UpdateAsync(RentalRequest entity)
    {
        _db.RentalRequests.Update(entity);
        await _db.SaveChangesAsync();
        return entity;
    }

    /// <inheritdoc />
    public async Task<RentalRequest?> FindBestByOwnerAndTenantAsync(Guid ownerId, Guid tenantId)
    {
        // Find all requests where the tenant matches and the listing belongs to the owner
        var requests = await _db.RentalRequests
            .Include(r => r.Listing).ThenInclude(l => l!.Property)
            .Where(r => r.TenantId == tenantId && r.Listing!.Property!.OwnerId == ownerId)
            .ToListAsync();

        if (requests.Count == 0) return null;

        // Priority: Accepted > Pending > rest (by most recent)
        return requests
            .OrderByDescending(r => r.Status == "Accepted" ? 2 : r.Status == "Pending" ? 1 : 0)
            .ThenByDescending(r => r.SubmittedAt)
            .First();
    }
}
