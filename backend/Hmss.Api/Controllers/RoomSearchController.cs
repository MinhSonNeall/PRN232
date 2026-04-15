using Hmss.Api.DTOs.Search;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Repositories.Interfaces;
using Hmss.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/room-search")]
public class RoomSearchController : ControllerBase
{
    private readonly IRoomListingRepository _listingRepo;
    private readonly IPropertyRepository _propertyRepo;
    private readonly SearchMatchingService _searchService;
    private readonly IMapGateway _mapsGateway;

    public RoomSearchController(IRoomListingRepository listingRepo, IPropertyRepository propertyRepo, SearchMatchingService searchService, IMapGateway mapsGateway)
    {
        _listingRepo = listingRepo;
        _propertyRepo = propertyRepo;
        _searchService = searchService;
        _mapsGateway = mapsGateway;
    }

    [HttpGet("page")]
    public async Task<IActionResult> GetSearchPage()
    {
        var listings = await _listingRepo.FindPublishedListingsAsync();
        var summaries = _searchService.BuildListingSummaries(listings);
        var properties = _searchService.BuildPropertySummaries(listings);
        var locationData = await _mapsGateway.GetLocationDataAsync(listings);
        var propertyLocations = await _mapsGateway.GetPropertyLocationDataAsync(properties);
        return Ok(new SearchPageResponseDto { Summaries = summaries, LocationData = locationData, Properties = properties, PropertyLocations = propertyLocations });
    }

    [HttpPost("search")]
    public async Task<IActionResult> SearchRooms([FromBody] SearchCriteriaDto criteria)
    {
        var allListings = await _listingRepo.FindPublishedListingsAsync();
        var filtered = _searchService.FilterByCriteria(allListings, criteria);
        var summaries = _searchService.BuildListingSummaries(filtered);
        var properties = _searchService.BuildPropertySummaries(filtered);
        var locationData = await _mapsGateway.GetLocationDataAsync(filtered);
        var propertyLocations = await _mapsGateway.GetPropertyLocationDataAsync(properties);
        return Ok(new SearchResponseDto { Summaries = summaries, LocationData = locationData, Properties = properties, PropertyLocations = propertyLocations, HasResults = filtered.Count > 0 });
    }

    [HttpGet("listing/{listingId:guid}")]
    public async Task<IActionResult> GetListingEntryPoint(Guid listingId)
    {
        var listing = await _listingRepo.FindPublishedByIdAsync(listingId);
        if (listing == null) return NotFound();
        return Ok(new ListingEntryPointResponseDto
        {
            ListingId = listing.ListingId,
            DetailUrl = $"/api/room/{listing.ListingId}"
        });
    }
}
