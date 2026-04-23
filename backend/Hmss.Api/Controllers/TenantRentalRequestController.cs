using Hmss.Api.Auth;
using Hmss.Api.DTOs.RentalRequest;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Logic;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/rental-request")]
[Authorize(Policy = "TenantOnly")]
public class TenantRentalRequestController : ControllerBase
{
    private readonly IRentalRequestRepository _requestRepo;
    private readonly RentalRequestLogic _logic;
    private readonly IEmailGateway _email;
    private readonly IUserAccountRepository _userRepo;

    public TenantRentalRequestController(
        IRentalRequestRepository requestRepo, RentalRequestLogic logic,
        IEmailGateway email, IUserAccountRepository userRepo)
    {
        _requestRepo = requestRepo;
        _logic = logic;
        _email = email;
        _userRepo = userRepo;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetTenantRequests()
    {
        var tenantId = ClaimsHelper.GetUserId(User);
        var requests = await _requestRepo.FindByTenantIdAsync(tenantId);
        var result = requests.Select(r =>
        {
            var actions = r.Status == "Pending" ? new List<string> { "Cancel" } : new List<string>();
            return new RentalRequestSummaryDto
            {
                RequestId = r.RequestId,
                ListingTitle = r.Listing?.Title ?? string.Empty,
                MoveInDate = r.MoveInDate,
                IsRoommateWanted = r.IsRoommateWanted,
                Status = r.Status,
                SubmittedAt = r.SubmittedAt,
                AvailableActions = actions
            };
        });
        return Ok(result);
    }

    [HttpGet("{requestId:guid}/detail")]
    public async Task<IActionResult> GetRequestDetail(Guid requestId)
    {
        var tenantId = ClaimsHelper.GetUserId(User);
        // Use WithProperty variant to resolve OwnerId for chat header
        var request = await _requestRepo.FindByIdWithPropertyAsync(requestId);
        if (request == null || request.TenantId != tenantId) return NotFound();

        // Resolve owner name for chat — graceful fallback if nav props missing
        var ownerId = request.Listing?.Property?.OwnerId;
        var ownerName = string.Empty;
        if (ownerId.HasValue)
        {
            var owner = await _userRepo.FindByIdAsync(ownerId.Value);
            ownerName = owner?.FullName ?? string.Empty;
        }

        return Ok(new RequestDetailResponseDto
        {
            RequestId = request.RequestId,
            ListingId = request.ListingId,
            ListingTitle = request.Listing?.Title ?? string.Empty,
            MoveInDate = request.MoveInDate,
            ExpectedRentalDuration = request.ExpectedRentalDuration,
            OccupantCount = request.OccupantCount,
            OccupationCategory = request.OccupationCategory,
            IsRoommateWanted = request.IsRoommateWanted,
            BudgetExpectation = request.BudgetExpectation,
            ContactPhone = request.ContactPhone,
            PreferredContactMethod = request.PreferredContactMethod,
            SpecialNotes = request.SpecialNotes,
            Status = request.Status,
            SubmittedAt = request.SubmittedAt,
            DecidedAt = request.DecidedAt,
            OwnerName = ownerName
        });
    }

    [HttpGet("{requestId:guid}/cancellation-check")]
    public async Task<IActionResult> CheckCancellationEligibility(Guid requestId)
    {
        var tenantId = ClaimsHelper.GetUserId(User);
        var request = await _requestRepo.FindByIdAsync(requestId);
        if (request == null || request.TenantId != tenantId) return NotFound();
        var result = _logic.ValidateCancellationEligibility(request);
        return Ok(new EligibilityResponseDto { Eligible = result.IsValid, Reason = result.Errors.FirstOrDefault() });
    }

    [HttpPost("{requestId:guid}/cancel")]
    public async Task<IActionResult> SubmitCancellation(Guid requestId)
    {
        var tenantId = ClaimsHelper.GetUserId(User);
        var request = await _requestRepo.FindByIdAsync(requestId);
        if (request == null || request.TenantId != tenantId) return NotFound();

        var validation = _logic.ValidateCancellationEligibility(request);
        if (!validation.IsValid) return BadRequest(new { Errors = validation.Errors });

        var result = request.ApplyCancellation();
        if (!result.Success) return BadRequest(new { Error = result.ErrorMessage });

        await _requestRepo.UpdateAsync(request);

        var tenant = await _userRepo.FindByIdAsync(tenantId);
        if (tenant != null)
            _email.SendAsync(new EmailMessage(tenant.Email, "Request Cancelled", "Your rental request has been cancelled."));

        return Ok(new CancellationResponseDto { RequestId = request.RequestId, NewStatus = request.Status, Message = "Request cancelled" });
    }
}
