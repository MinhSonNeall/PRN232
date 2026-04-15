using Hmss.Api.DTOs.Admin;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Logic;
using Hmss.Api.Repositories.Interfaces;
using Hmss.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/admin/listings")]
[Authorize(Policy = "SystemAdminOnly")]
public class ControlListingController : ControllerBase
{
    private readonly IRoomListingRepository _listingRepo;
    private readonly IUserAccountRepository _userRepo;
    private readonly ListingControlLogic _logic;
    private readonly NotificationService _notification;
    private readonly IEmailGateway _email;

    public ControlListingController(
        IRoomListingRepository listingRepo, IUserAccountRepository userRepo,
        ListingControlLogic logic, NotificationService notification, IEmailGateway email)
    {
        _listingRepo = listingRepo; _userRepo = userRepo;
        _logic = logic; _notification = notification; _email = email;
    }

    [HttpGet]
    public async Task<IActionResult> GetVisibleListings()
    {
        var listings = await _listingRepo.FindByStatusAsync("PublishedAvailable");
        var result = new List<AdminListingSummaryDto>();
        foreach (var l in listings)
        {
            var property = l.Property;
            Hmss.Api.Entities.UserAccount? owner = null;
            if (property != null) owner = await _userRepo.FindByIdAsync(property.OwnerId);
            result.Add(new AdminListingSummaryDto
            {
                ListingId = l.ListingId, Title = l.Title,
                OwnerName = owner?.FullName ?? string.Empty,
                Price = l.Price, Status = l.Status,
                Address = property?.Address ?? string.Empty
            });
        }
        return Ok(result);
    }

    [HttpGet("{listingId:guid}")]
    public async Task<IActionResult> GetListingDetails(Guid listingId)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound();

        var property = listing.Property;
        Hmss.Api.Entities.UserAccount? owner = null;
        if (property != null) owner = await _userRepo.FindByIdAsync(property.OwnerId);

        var images = new List<string>();
        if (!string.IsNullOrWhiteSpace(listing.ImagesRef))
        {
            try { images = JsonSerializer.Deserialize<List<string>>(listing.ImagesRef) ?? new(); } catch { }
        }

        return Ok(new AdminListingDetailDto
        {
            ListingId = listing.ListingId, Title = listing.Title, Description = listing.Description,
            OwnerName = owner?.FullName ?? string.Empty, OwnerEmail = owner?.Email ?? string.Empty,
            Price = listing.Price, Status = listing.Status,
            Address = property?.Address ?? string.Empty, Images = images
        });
    }

    [HttpPost("{listingId:guid}/disable")]
    public async Task<IActionResult> DisableListing(Guid listingId)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound();

        var validation = _logic.ValidateDisableAction(listing);
        if (!validation.IsValid) return BadRequest(new { Errors = validation.Errors });

        var result = listing.Archive();
        if (!result.Success) return BadRequest(new { Error = result.ErrorMessage });

        await _listingRepo.UpdateAsync(listing);

        // Email the property owner about the disabled listing
        var ownerId = listing.Property?.OwnerId;
        if (ownerId.HasValue)
        {
            var owner = await _userRepo.FindByIdAsync(ownerId.Value);
            if (owner != null)
            {
                _email.SendAsync(new Gateways.Interfaces.EmailMessage(
                    owner.Email,
                    "Your Listing Has Been Disabled",
                    $"Dear {owner.FullName},\n\nYour listing \"{listing.Title}\" has been disabled by an administrator.\n\nIf you believe this was done in error, please contact support."));
            }
        }

        return Ok(new ControlActionDto { ListingId = listing.ListingId, NewStatus = listing.Status, Message = "Listing archived by admin" });
    }
}
