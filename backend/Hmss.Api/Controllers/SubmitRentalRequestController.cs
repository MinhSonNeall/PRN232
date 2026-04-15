using Hmss.Api.Auth;
using Hmss.Api.DTOs.RentalRequest;
using Hmss.Api.Entities;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Logic;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/rental-request")]
[Authorize(Policy = "TenantOnly")]
public class SubmitRentalRequestController : ControllerBase
{
    private readonly IRoomListingRepository _listingRepo;
    private readonly IRentalRequestRepository _requestRepo;
    private readonly RentalRequestLogic _logic;
    private readonly IEmailGateway _email;
    private readonly IUserAccountRepository _userRepo;

    public SubmitRentalRequestController(
        IRoomListingRepository listingRepo,
        IRentalRequestRepository requestRepo,
        RentalRequestLogic logic,
        IEmailGateway email,
        IUserAccountRepository userRepo)
    {
        _listingRepo = listingRepo;
        _requestRepo = requestRepo;
        _logic = logic;
        _email = email;
        _userRepo = userRepo;
    }

    [HttpGet("form/{listingId:guid}")]
    public async Task<IActionResult> GetRentalRequestForm(Guid listingId)
    {
        var listing = await _listingRepo.FindByIdAsync(listingId);
        if (listing == null) return NotFound();
        return Ok(new RentalRequestFormResponseDto
        {
            ListingId = listing.ListingId,
            ListingTitle = listing.Title,
            Price = listing.Price,
            Address = listing.Property?.Address ?? string.Empty
        });
    }

    [HttpPost]
    public async Task<IActionResult> SubmitRentalRequest([FromBody] RentalRequestDto request)
    {
        var tenantId = ClaimsHelper.GetUserId(User);
        var listing = await _listingRepo.FindByIdAsync(request.ListingId);
        if (listing == null) return NotFound("Listing not found");

        var validation = await _logic.ValidateRequestabilityWithDuplicateCheckAsync(listing, tenantId);
        if (!validation.IsValid)
            return BadRequest(new { Errors = validation.Errors });

        var rentalRequest = RentalRequest.Create(
            request.ListingId, tenantId, request.MoveInDate, request.ExpectedRentalDuration,
            request.OccupantCount, request.OccupationCategory, request.BudgetExpectation,
            request.ContactPhone, request.PreferredContactMethod, request.SpecialNotes);

        var saved = await _requestRepo.SaveAsync(rentalRequest);

        var tenant = await _userRepo.FindByIdAsync(tenantId);
        if (tenant != null)
        {
            _email.SendAsync(new EmailMessage(tenant.Email, "Rental Request Submitted",
                $"Your rental request for {listing.Title} has been submitted."));
        }

        // Notify the property owner about the new request
        var ownerId = listing.Property?.OwnerId;
        if (ownerId.HasValue)
        {
            var owner = await _userRepo.FindByIdAsync(ownerId.Value);
            if (owner != null)
            {
                _email.SendAsync(new EmailMessage(owner.Email, "New Rental Request Received",
                    $"You have received a new rental request for \"{listing.Title}\" from {tenant?.FullName ?? "a tenant"}."));
            }
        }

        return Created($"/api/rental-request/{saved.RequestId}/detail",
            new SubmissionResponseDto { RequestId = saved.RequestId, Status = saved.Status, Message = "Request submitted successfully" });
    }
}
