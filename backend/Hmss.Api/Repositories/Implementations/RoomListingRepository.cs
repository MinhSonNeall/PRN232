using Hmss.Api.Data;
using Hmss.Api.Entities;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hmss.Api.Repositories.Implementations;

public class RoomListingRepository : IRoomListingRepository
{
    private readonly HmssDbContext _db;
    public RoomListingRepository(HmssDbContext db) => _db = db;

    public async Task<List<RoomListing>> FindPublishedListingsAsync() =>
        await _db.RoomListings.Include(x => x.Property)
            .Where(x => x.Status == "PublishedAvailable")
            .ToListAsync();

    public async Task<RoomListing?> FindPublishedByIdAsync(Guid id) =>
        await _db.RoomListings.Include(x => x.Property)
            .FirstOrDefaultAsync(x => x.ListingId == id && x.Status == "PublishedAvailable");

    public async Task<RoomListing?> FindVisibleListingByIdAsync(Guid id) =>
        await _db.RoomListings.Include(x => x.Property)
            .FirstOrDefaultAsync(x => x.ListingId == id && (x.Status == "PublishedAvailable" || x.Status == "Hidden"));

    public async Task<RoomListing?> FindByIdAsync(Guid id) =>
        await _db.RoomListings.Include(x => x.Property).FirstOrDefaultAsync(x => x.ListingId == id);

    public async Task<List<RoomListing>> FindByPropertyIdAsync(Guid propertyId) =>
        await _db.RoomListings.Where(x => x.PropertyId == propertyId).ToListAsync();

    public async Task<List<RoomListing>> FindByOwnerIdAsync(Guid ownerId) =>
        await _db.RoomListings.Include(x => x.Property)
            .Where(x => x.Property!.OwnerId == ownerId).ToListAsync();

    public async Task<RoomListing?> FindByRequestIdAsync(Guid requestId)
    {
        var request = await _db.RentalRequests.FindAsync(requestId);
        if (request == null) return null;
        return await _db.RoomListings.FindAsync(request.ListingId);
    }

    public async Task<RoomListing> SaveAsync(RoomListing entity)
    {
        _db.RoomListings.Add(entity);
        await _db.SaveChangesAsync();
        return entity;
    }

    public async Task<RoomListing> UpdateAsync(RoomListing entity)
    {
        _db.RoomListings.Update(entity);
        await _db.SaveChangesAsync();
        return entity;
    }

    public async Task<List<RoomListing>> FindByStatusAsync(string status) =>
        await _db.RoomListings.Include(x => x.Property)
            .Where(x => x.Status == status).ToListAsync();
}
