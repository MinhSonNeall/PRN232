using Hmss.Api.Auth;
using Hmss.Api.DTOs.Listing;
using Hmss.Api.Entities;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Logic;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/listing")]
[Authorize(Policy = "OwnerOnly")]
public class RoomListingController : ControllerBase
{
    private readonly IRoomListingRepository _listingRepo;
    private readonly IRentalRequestRepository _requestRepo;
    private readonly IOwnerVerificationRepository _verificationRepo;
    private readonly ICloudStorageGateway _storage;
    private readonly IEmailGateway _email;
    private readonly IPropertyRepository _propertyRepo;
    private readonly RoomListingLogic _listingLogic;
    private readonly PublishListingLogic _publishLogic;
    private readonly VisibilityLogic _visibilityLogic;
    private readonly ReopenLogic _reopenLogic;

    public RoomListingController(
        IRoomListingRepository listingRepo, IRentalRequestRepository requestRepo,
        IOwnerVerificationRepository verificationRepo, ICloudStorageGateway storage,
        IEmailGateway email, IPropertyRepository propertyRepo,
        RoomListingLogic listingLogic, PublishListingLogic publishLogic,
        VisibilityLogic visibilityLogic, ReopenLogic reopenLogic)
    {
        _listingRepo = listingRepo; _requestRepo = requestRepo;
        _verificationRepo = verificationRepo; _storage = storage;
        _email = email; _propertyRepo = propertyRepo;
        _listingLogic = listingLogic; _publishLogic = publishLogic;
        _visibilityLogic = visibilityLogic; _reopenLogic = reopenLogic;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetOwnerListings()
    {
        var ownerId = ClaimsHelper.GetUserId(User);
        var listings = await _listingRepo.FindByOwnerIdAsync(ownerId);
        return Ok(listings.Select(l => new ListingResponseDto { ListingId = l.ListingId, Title = l.Title, Status = l.Status, PropertyId = l.PropertyId }));
    }

    [HttpGet("form/{propertyId:guid}")]
    public async Task<IActionResult> GetRoomListingForm(Guid propertyId)
    {
        var property = await _propertyRepo.FindByIdAsync(propertyId);
        if (property == null) return NotFound();
        return Ok(new { propertyId, propertyName = property.Name, propertyAddress = property.Address });
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessListingDetails([FromForm] RoomListingDraftDto request, IFormFileCollection images)
    {
        var validation = _listingLogic.ValidateRequiredFields(request);
        if (!validation.IsValid) return BadRequest(new { Errors = validation.Errors });

        var imageUrls = images.Count > 0 ? await _storage.UploadImagesAsync(images) : new List<string>();
        return Ok(new { imageUrls });
    }

    [HttpPost]
    public async Task<IActionResult> SaveDraftListing([FromBody] RoomListingDraftDto request)
    {
        var imagesJson = request.ImageUrls.Count > 0 ? JsonSerializer.Serialize(request.ImageUrls) : null;
        var listing = RoomListing.Create(request.PropertyId, request.Title, request.Description,
            request.Price, request.Capacity, request.Amenities, request.AvailableFrom,
            request.FurnishedStatus, request.PrivateWCStatus, imagesJson);
        var saved = await _listingRepo.SaveAsync(listing);
        return Created($"/api/listing/{saved.ListingId}/edit",
            new ListingResponseDto { ListingId = saved.ListingId, Title = saved.Title, Status = saved.Status, PropertyId = saved.PropertyId, Message = "Draft saved" });
    }

    [HttpGet("{listingId:guid}/edit")]
    public async Task<IActionResult> GetListingForUpdate(Guid listingId)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound();
        var ownerId = ClaimsHelper.GetUserId(User);
        if (listing.Property?.OwnerId != ownerId) return Forbid();

        var imageUrls = new List<string>();
        if (!string.IsNullOrWhiteSpace(listing.ImagesRef))
        {
            try { imageUrls = JsonSerializer.Deserialize<List<string>>(listing.ImagesRef) ?? new(); } catch { }
        }

        return Ok(new
        {
            listing.ListingId, listing.Title, listing.Description, listing.Price,
            listing.Capacity, listing.Amenities, listing.AvailableFrom,
            listing.FurnishedStatus, listing.PrivateWCStatus, listing.Status,
            ImageUrls = imageUrls
        });
    }

    [HttpPost("{listingId:guid}/process")]
    public async Task<IActionResult> ProcessListingUpdates(Guid listingId, IFormFileCollection newImages)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound();
        var imageUrls = newImages.Count > 0 ? await _storage.UploadImagesAsync(newImages) : new List<string>();
        return Ok(new { imageUrls });
    }

    [HttpPut("{listingId:guid}")]
    public async Task<IActionResult> SubmitListingUpdate(Guid listingId, [FromBody] RoomListingUpdateDto request)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound();
        var ownerId = ClaimsHelper.GetUserId(User);
        if (listing.Property?.OwnerId != ownerId) return Forbid();

        var result = listing.ApplyUpdates(request, request.ImageUrls);
        if (!result.Success) return BadRequest(new { Error = result.ErrorMessage });

        await _listingRepo.UpdateAsync(listing);
        return Ok(new ListingResponseDto { ListingId = listing.ListingId, Title = listing.Title, Status = listing.Status, PropertyId = listing.PropertyId, Message = "Updated" });
    }

    [HttpGet("{listingId:guid}/publish-form")]
    public async Task<IActionResult> GetPublicationForm(Guid listingId)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound();
        return Ok(new PublicationFormDto { ListingId = listing.ListingId, Title = listing.Title, Status = listing.Status, HasImages = !string.IsNullOrWhiteSpace(listing.ImagesRef) });
    }

    [HttpGet("{listingId:guid}/publish-check")]
    public async Task<IActionResult> CheckPublicationEligibility(Guid listingId)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound();
        var ownerId = ClaimsHelper.GetUserId(User);
        var isVerified = await _verificationRepo.IsOwnerVerifiedAsync(ownerId);
        var validation = _publishLogic.ValidateEligibility(listing, isVerified);
        return Ok(new PublicationEligibilityDto { Eligible = validation.IsValid, Blockers = validation.Errors });
    }

    [HttpPost("{listingId:guid}/publish")]
    public async Task<IActionResult> SubmitPublication(Guid listingId)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound();
        var ownerId = ClaimsHelper.GetUserId(User);
        if (listing.Property?.OwnerId != ownerId) return Forbid();

        var isVerified = await _verificationRepo.IsOwnerVerifiedAsync(ownerId);
        var validation = _publishLogic.ValidateEligibility(listing, isVerified);
        if (!validation.IsValid) return BadRequest(new { Errors = validation.Errors });

        var result = listing.Publish();
        if (!result.Success) return BadRequest(new { Error = result.ErrorMessage });

        await _listingRepo.UpdateAsync(listing);
        _email.SendAsync(new EmailMessage("owner@hmss.local", "Listing Published", $"{listing.Title} is now live."));
        return Ok(new ListingResponseDto { ListingId = listing.ListingId, Title = listing.Title, Status = listing.Status, PropertyId = listing.PropertyId, Message = "Published" });
    }

    [HttpGet("{listingId:guid}/visibility")]
    public async Task<IActionResult> GetListingVisibilityDetails(Guid listingId)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound();
        var actions = listing.Status switch
        {
            "PublishedAvailable" => new List<string> { "Hide" },
            "Hidden" => new List<string> { "Show" },
            _ => new List<string>()
        };
        return Ok(new VisibilityResponseDto { ListingId = listing.ListingId, Status = listing.Status, AvailableActions = actions });
    }

    [HttpGet("{listingId:guid}/visibility-check")]
    public async Task<IActionResult> CheckActionValidity(Guid listingId, [FromQuery] string action)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound();
        var validation = _visibilityLogic.ValidateVisibilityAction(listing, action);
        return Ok(new { valid = validation.IsValid, reason = validation.Errors.FirstOrDefault() });
    }

    [HttpPost("{listingId:guid}/visibility")]
    public async Task<IActionResult> SubmitVisibilityChange(Guid listingId, [FromBody] VisibilityActionRequest actionRequest)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound();
        var ownerId = ClaimsHelper.GetUserId(User);
        if (listing.Property?.OwnerId != ownerId) return Forbid();

        var validation = _visibilityLogic.ValidateVisibilityAction(listing, actionRequest.Action);
        if (!validation.IsValid) return BadRequest(new { Errors = validation.Errors });

        var result = actionRequest.Action == "Hide" ? listing.Hide() : listing.Show();
        if (!result.Success) return BadRequest(new { Error = result.ErrorMessage });

        await _listingRepo.UpdateAsync(listing);
        return Ok(new ListingResponseDto { ListingId = listing.ListingId, Title = listing.Title, Status = listing.Status, PropertyId = listing.PropertyId });
    }

    [HttpGet("accepted-arrangements")]
    public async Task<IActionResult> GetAcceptedArrangements()
    {
        var ownerId = ClaimsHelper.GetUserId(User);
        var requests = await _requestRepo.FindAcceptedByOwnerIdAsync(ownerId);
        return Ok(requests.Select(r => new AcceptedArrangementDto
        {
            RequestId = r.RequestId,
            ListingId = r.ListingId,
            ListingTitle = r.Listing?.Title ?? string.Empty,
            TenantName = r.Tenant?.FullName ?? string.Empty,
            MoveInDate = r.MoveInDate,
            AcceptedAt = r.DecidedAt
        }));
    }

    [HttpPost("reopen-by-listing/{listingId:guid}")]
    public async Task<IActionResult> ReopenByListing(Guid listingId)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound("Listing not found");
        if (listing.Status != "Locked") return BadRequest(new { Error = "Only Locked listings can be reopened" });

        // Find the accepted request for this listing
        var requests = await _requestRepo.FindByRoomIdAsync(listingId);
        var accepted = requests.FirstOrDefault(r => r.Status == "Accepted");
        if (accepted == null) return BadRequest(new { Error = "No accepted request found for this listing" });

        var revokeResult = accepted.Revoke();
        if (!revokeResult.Success) return BadRequest(new { Error = revokeResult.ErrorMessage });
        await _requestRepo.UpdateAsync(accepted);

        var reopenResult = listing.Reopen();
        if (!reopenResult.Success) return BadRequest(new { Error = reopenResult.ErrorMessage });
        await _listingRepo.UpdateAsync(listing);

        return Ok(new StatusChangeResponseDto { Id = listingId, NewStatus = listing.Status, Message = "Listing reopened" });
    }

    [HttpGet("{requestId:guid}/reopen-check")]
    public async Task<IActionResult> CheckReopenEligibility(Guid requestId)
    {
        var request = await _requestRepo.FindByIdAsync(requestId);
        if (request == null) return NotFound();
        var validation = _reopenLogic.ValidateConcurrencyStatus(request);
        return Ok(new { eligible = validation.IsValid, reason = validation.Errors.FirstOrDefault() });
    }

    [HttpPost("{requestId:guid}/reopen")]
    public async Task<IActionResult> SubmitReopen(Guid requestId)
    {
        var request = await _requestRepo.FindByIdAsync(requestId);
        if (request == null) return NotFound();

        var validation = _reopenLogic.ValidateConcurrencyStatus(request);
        if (!validation.IsValid) return BadRequest(new { Errors = validation.Errors });

        var revokeResult = request.Revoke();
        if (!revokeResult.Success) return BadRequest(new { Error = revokeResult.ErrorMessage });
        await _requestRepo.UpdateAsync(request);

        var listing = await _listingRepo.FindByIdAsync(request.ListingId);
        if (listing != null)
        {
            var reopenResult = listing.Reopen();
            if (!reopenResult.Success) return BadRequest(new { Error = reopenResult.ErrorMessage });
            await _listingRepo.UpdateAsync(listing);
        }

        _email.SendAsync(new EmailMessage("tenant@hmss.local", "Arrangement Revoked", "The owner has revoked your accepted request."));
        return Ok(new StatusChangeResponseDto { Id = requestId, NewStatus = request.Status, Message = "Arrangement revoked and listing reopened" });
    }
}

public class VisibilityActionRequest
{
    public string Action { get; set; } = string.Empty;
}
