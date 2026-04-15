using Hmss.Api.DTOs.Property;
using Hmss.Api.DTOs.Search;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Repositories.Interfaces;
using Hmss.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/property-view")]
public class ViewPropertyController : ControllerBase
{
    private readonly IPropertyRepository _propertyRepo;
    private readonly IRoomListingRepository _listingRepo;
    private readonly IMapGateway _mapsGateway;
    private readonly SearchMatchingService _searchService;

    public ViewPropertyController(IPropertyRepository propertyRepo, IRoomListingRepository listingRepo, IMapGateway mapsGateway, SearchMatchingService searchService)
    {
        _propertyRepo = propertyRepo;
        _listingRepo = listingRepo;
        _mapsGateway = mapsGateway;
        _searchService = searchService;
    }

    [HttpGet("{propertyId:guid}")]
    public async Task<IActionResult> GetPropertyDetails(Guid propertyId)
    {
        var property = await _propertyRepo.FindByIdAsync(propertyId);
        if (property == null) return NotFound();

        var allListings = await _listingRepo.FindByPropertyIdAsync(propertyId);
        var publishedListings = allListings.Where(l => l.Status == "PublishedAvailable").ToList();
        var summaries = _searchService.BuildListingSummaries(publishedListings);

        List<string> images = new();
        if (!string.IsNullOrWhiteSpace(property.ImagesRef))
        {
            try { images = JsonSerializer.Deserialize<List<string>>(property.ImagesRef) ?? new(); } catch { }
        }

        return Ok(new PropertyDetailDto
        {
            PropertyId = property.PropertyId,
            Name = property.Name,
            Address = property.Address,
            MapLocation = property.MapLocation,
            Description = property.Description,
            GeneralPolicies = property.GeneralPolicies,
            Images = images,
            Listings = summaries
        });
    }

    [HttpGet("{propertyId:guid}/map")]
    public async Task<IActionResult> GetPropertyMap(Guid propertyId)
    {
        var property = await _propertyRepo.FindByIdAsync(propertyId);
        if (property == null) return NotFound();

        var location = property.MapLocation ?? property.Address;
        var mapDto = await _mapsGateway.GetMapDataAsync(location);
        return Ok(mapDto);
    }
}
