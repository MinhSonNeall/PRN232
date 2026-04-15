using Hmss.Api.Entities;

namespace Hmss.Api.Repositories.Interfaces;

public interface IRoomListingRepository
{
    Task<List<RoomListing>> FindPublishedListingsAsync();
    Task<RoomListing?> FindPublishedByIdAsync(Guid id);
    Task<RoomListing?> FindVisibleListingByIdAsync(Guid id); // PublishedAvailable or Hidden
    Task<RoomListing?> FindByIdAsync(Guid id);
    Task<List<RoomListing>> FindByPropertyIdAsync(Guid propertyId);
    Task<List<RoomListing>> FindByOwnerIdAsync(Guid ownerId);
    Task<RoomListing?> FindByRequestIdAsync(Guid requestId);
    Task<RoomListing> SaveAsync(RoomListing entity);
    Task<RoomListing> UpdateAsync(RoomListing entity);
    Task<List<RoomListing>> FindByStatusAsync(string status);
}
