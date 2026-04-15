using Hmss.Api.Auth;
using Hmss.Api.DTOs.Review;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Logic;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/rental-request")]
[Authorize(Policy = "OwnerOnly")]
public class ReviewRentalRequestController : ControllerBase
{
    private readonly IRentalRequestRepository _requestRepo;
    private readonly IRoomListingRepository _listingRepo;
    private readonly ReviewRequestLogic _logic;
    private readonly IEmailGateway _email;
    private readonly IUserAccountRepository _userRepo;

    public ReviewRentalRequestController(
        IRentalRequestRepository requestRepo, IRoomListingRepository listingRepo,
        ReviewRequestLogic logic, IEmailGateway email, IUserAccountRepository userRepo)
    {
        _requestRepo = requestRepo; _listingRepo = listingRepo;
        _logic = logic; _email = email; _userRepo = userRepo;
    }

    [HttpGet("room/{roomId:guid}")]
    public async Task<IActionResult> GetRoomRequests(Guid roomId)
    {
        var requests = await _requestRepo.FindByRoomIdAsync(roomId);
        return Ok(requests.Select(MapToSummary));
    }

    [HttpGet("owner-all")]
    public async Task<IActionResult> GetOwnerAllRequests()
    {
        var ownerId = ClaimsHelper.GetUserId(User);
        var requests = await _requestRepo.FindAllByOwnerIdAsync(ownerId);
        return Ok(requests.Select(MapToSummary));
    }

    private static RequestSummaryDto MapToSummary(Entities.RentalRequest r) => new()
    {
        RequestId = r.RequestId,
        ListingId = r.ListingId,
        TenantName = r.Tenant?.FullName ?? string.Empty,
        MoveInDate = r.MoveInDate,
        Status = r.Status,
        SubmittedAt = r.SubmittedAt,
        ContactPhone = r.ContactPhone,
        SpecialNotes = r.SpecialNotes,
        ListingTitle = r.Listing?.Title ?? string.Empty,
        PropertyName = r.Listing?.Property?.Name ?? string.Empty,
    };

    [HttpGet("{requestId:guid}/owner-detail")]
    public async Task<IActionResult> GetRequestDetail(Guid requestId)
    {
        var request = await _requestRepo.FindByIdAsync(requestId);
        if (request == null) return NotFound();
        return Ok(new RequestDetailResponseDto
        {
            RequestId = request.RequestId,
            TenantName = request.Tenant?.FullName ?? string.Empty,
            TenantEmail = request.Tenant?.Email ?? string.Empty,
            TenantPhone = request.Tenant?.Phone ?? string.Empty,
            MoveInDate = request.MoveInDate,
            ExpectedRentalDuration = request.ExpectedRentalDuration,
            OccupantCount = request.OccupantCount,
            OccupationCategory = request.OccupationCategory,
            BudgetExpectation = request.BudgetExpectation,
            ContactPhone = request.ContactPhone,
            PreferredContactMethod = request.PreferredContactMethod,
            SpecialNotes = request.SpecialNotes,
            Status = request.Status,
            SubmittedAt = request.SubmittedAt
        });
    }

    [HttpPost("{requestId:guid}/accept")]
    public async Task<IActionResult> AcceptRequest(Guid requestId)
    {
        var request = await _requestRepo.FindByIdAsync(requestId);
        if (request == null) return NotFound();
        var listing = await _listingRepo.FindByIdAsync(request.ListingId);
        if (listing == null) return NotFound("Listing not found");

        var validation = _logic.ValidateAcceptance(request, listing);
        if (!validation.IsValid) return BadRequest(new { Errors = validation.Errors });

        var acceptResult = request.Accept();
        if (!acceptResult.Success) return BadRequest(new { Error = acceptResult.ErrorMessage });
        var lockResult = listing.Lock();
        if (!lockResult.Success) return BadRequest(new { Error = lockResult.ErrorMessage });

        await _requestRepo.UpdateAsync(request);
        await _listingRepo.UpdateAsync(listing);

        var tenant = request.Tenant;
        if (tenant != null)
            _email.SendAsync(new EmailMessage(tenant.Email, "Rental Request Accepted", $"Your request for {listing.Title} has been accepted!"));

        return Ok(new DecisionResponseDto { RequestId = request.RequestId, NewStatus = request.Status, Message = "Request accepted and listing locked" });
    }

    [HttpPost("{requestId:guid}/reject")]
    public async Task<IActionResult> RejectRequest(Guid requestId)
    {
        var request = await _requestRepo.FindByIdAsync(requestId);
        if (request == null) return NotFound();

        var rejectResult = request.Reject();
        if (!rejectResult.Success) return BadRequest(new { Error = rejectResult.ErrorMessage });

        await _requestRepo.UpdateAsync(request);

        var tenant = request.Tenant;
        var listingTitle = request.Listing?.Title ?? string.Empty;
        if (tenant != null)
            _email.SendAsync(new EmailMessage(tenant.Email, "Rental Request Rejected", $"Your request for {listingTitle} has been rejected."));

        return Ok(new DecisionResponseDto { RequestId = request.RequestId, NewStatus = request.Status, Message = "Request rejected" });
    }
}
