using Hmss.Api.Auth;
using Hmss.Api.DTOs.Property;
using Hmss.Api.Entities;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Logic;
using Hmss.Api.Repositories.Interfaces;
using Hmss.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/property")]
[Authorize(Policy = "OwnerOnly")]
public class PropertyController : ControllerBase
{
    private readonly IPropertyRepository _propertyRepo;
    private readonly ICloudStorageGateway _storage;
    private readonly PropertyService _service;
    private readonly PropertyLogic _logic;

    public PropertyController(IPropertyRepository propertyRepo, ICloudStorageGateway storage, PropertyService service, PropertyLogic logic)
    {
        _propertyRepo = propertyRepo;
        _storage = storage;
        _service = service;
        _logic = logic;
    }

    [HttpGet("form")]
    public IActionResult GetCreatePropertyForm() => Ok(new PropertyFormResponseDto());

    [HttpPost("process")]
    public async Task<IActionResult> ProcessPropertyImages(IFormFileCollection images)
    {
        var imageUrls = images.Count > 0 ? await _storage.UploadImagesAsync(images) : new List<string>();
        return Ok(new { imageUrls });
    }

    [HttpPost]
    public async Task<IActionResult> CreateProperty([FromBody] PropertyDto request)
    {
        var validation = _service.ValidatePropertyFields(request);
        if (!validation.IsValid) return BadRequest(new { Errors = validation.Errors });

        var ownerId = ClaimsHelper.GetUserId(User);
        var imagesRef = request.ImageUrls.Count > 0 ? JsonSerializer.Serialize(request.ImageUrls) : null;
        var property = Property.Create(ownerId, request.Name, request.Address, request.MapLocation, request.Description, request.GeneralPolicies, imagesRef);
        var saved = await _propertyRepo.SaveAsync(property);

        return Created($"/api/property/{saved.PropertyId}",
            new PropertyResponseDto { PropertyId = saved.PropertyId, Name = saved.Name, Address = saved.Address, CreatedAt = saved.CreatedAt });
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetOwnerProperties()
    {
        var ownerId = ClaimsHelper.GetUserId(User);
        var properties = await _propertyRepo.FindByOwnerIdAsync(ownerId);
        return Ok(properties.Select(p => new PropertySummaryDto { PropertyId = p.PropertyId, Name = p.Name, Address = p.Address, UpdatedAt = p.UpdatedAt }));
    }

    [HttpGet("{propertyId:guid}/edit")]
    public async Task<IActionResult> GetPropertyForUpdate(Guid propertyId)
    {
        var property = await _propertyRepo.FindByIdAsync(propertyId);
        if (property == null) return NotFound();
        var ownerId = ClaimsHelper.GetUserId(User);
        if (property.OwnerId != ownerId) return Forbid();

        List<string> imageUrls = new();
        if (!string.IsNullOrWhiteSpace(property.ImagesRef))
        {
            try { imageUrls = JsonSerializer.Deserialize<List<string>>(property.ImagesRef) ?? new(); } catch { }
        }

        return Ok(new PropertyFormResponseDto
        {
            Name = property.Name, Address = property.Address, MapLocation = property.MapLocation,
            Description = property.Description, GeneralPolicies = property.GeneralPolicies,
            ImageUrls = imageUrls
        });
    }

    [HttpPost("{propertyId:guid}/process")]
    public async Task<IActionResult> ProcessPropertyUpdateImages(Guid propertyId, IFormFileCollection newImages)
    {
        var property = await _propertyRepo.FindByIdAsync(propertyId);
        if (property == null) return NotFound();
        var imageUrls = newImages.Count > 0 ? await _storage.UploadImagesAsync(newImages) : new List<string>();
        return Ok(new { imageUrls });
    }

    [HttpPut("{propertyId:guid}")]
    public async Task<IActionResult> UpdateProperty(Guid propertyId, [FromBody] PropertyUpdateDto request)
    {
        var property = await _propertyRepo.FindByIdAsync(propertyId);
        if (property == null) return NotFound();
        var ownerId = ClaimsHelper.GetUserId(User);
        if (property.OwnerId != ownerId) return Forbid();

        var validation = _logic.ValidateUpdate(property, request);
        if (!validation.IsValid) return BadRequest(new { Errors = validation.Errors });

        var result = property.ApplyUpdates(request, request.ImageUrls);
        if (!result.Success) return BadRequest(new { Error = result.ErrorMessage });

        var updated = await _propertyRepo.UpdateAsync(property);
        return Ok(new PropertyResponseDto { PropertyId = updated.PropertyId, Name = updated.Name, Address = updated.Address, CreatedAt = updated.CreatedAt });
    }
}
