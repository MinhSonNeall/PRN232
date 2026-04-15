using Hmss.Api.DTOs.Room;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Repositories.Interfaces;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/room")]
public class ViewRoomController : ControllerBase
{
    private readonly IRoomListingRepository _listingRepo;
    private readonly IMapGateway _mapsGateway;

    public ViewRoomController(IRoomListingRepository listingRepo, IMapGateway mapsGateway)
    {
        _listingRepo = listingRepo;
        _mapsGateway = mapsGateway;
    }

    [HttpGet("{listingId:guid}")]
    public async Task<IActionResult> GetRoomDetails(Guid listingId)
    {
        var listing = await _listingRepo.FindVisibleListingByIdAsync(listingId);
        if (listing == null) return NotFound();

        var amenities = new List<string>();
        if (!string.IsNullOrWhiteSpace(listing.Amenities))
        {
            try { amenities = JsonSerializer.Deserialize<List<string>>(listing.Amenities) ?? new(); } catch { }
        }

        var images = new List<string>();
        if (!string.IsNullOrWhiteSpace(listing.ImagesRef))
        {
            try { images = JsonSerializer.Deserialize<List<string>>(listing.ImagesRef) ?? new(); } catch { }
        }

        return Ok(new RoomDetailDto
        {
            ListingId = listing.ListingId,
            PropertyId = listing.PropertyId,
            OwnerId = listing.Property?.OwnerId ?? Guid.Empty,
            Title = listing.Title,
            Description = listing.Description,
            Price = listing.Price,
            Capacity = listing.Capacity,
            Amenities = amenities,
            AvailableFrom = listing.AvailableFrom,
            FurnishedStatus = listing.FurnishedStatus,
            PrivateWCStatus = listing.PrivateWCStatus,
            ImagesRef = images,
            Status = listing.Status,
            PropertyName = listing.Property?.Name ?? string.Empty,
            PropertyAddress = listing.Property?.Address ?? string.Empty,
            PropertyPolicies = listing.Property?.GeneralPolicies
        });
    }

    [HttpGet("{listingId:guid}/map")]
    public async Task<IActionResult> GetMapInformation(Guid listingId)
    {
        var listing = await _listingRepo.FindVisibleListingByIdAsync(listingId);
        if (listing == null) return NotFound();

        var location = listing.Property?.MapLocation ?? listing.Property?.Address ?? string.Empty;
        var mapDto = await _mapsGateway.GetMapDataAsync(location);
        return Ok(mapDto);
    }
}
