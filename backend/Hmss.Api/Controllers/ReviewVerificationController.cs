using Hmss.Api.DTOs.Admin;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Logic;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/admin/verification")]
[Authorize(Policy = "SystemAdminOnly")]
public class ReviewVerificationController : ControllerBase
{
    private readonly IOwnerVerificationRepository _verificationRepo;
    private readonly IUserAccountRepository _userRepo;
    private readonly ICloudStorageGateway _storage;
    private readonly IEmailGateway _email;
    private readonly VerificationLogic _logic;

    public ReviewVerificationController(
        IOwnerVerificationRepository verificationRepo, IUserAccountRepository userRepo,
        ICloudStorageGateway storage, IEmailGateway email, VerificationLogic logic)
    {
        _verificationRepo = verificationRepo; _userRepo = userRepo;
        _storage = storage; _email = email; _logic = logic;
    }

    [HttpGet]
    public async Task<IActionResult> GetPendingSubmissions()
    {
        var pending = await _verificationRepo.FindPendingAsync();
        var result = new List<SubmissionSummaryDto>();
        foreach (var v in pending)
        {
            var owner = await _userRepo.FindByIdAsync(v.OwnerId);
            result.Add(new SubmissionSummaryDto { VerificationId = v.VerificationId, OwnerId = v.OwnerId, OwnerName = owner?.FullName ?? string.Empty, SubmittedAt = v.SubmittedAt, Status = v.Status });
        }
        return Ok(result);
    }

    [HttpGet("{verificationId:guid}")]
    public async Task<IActionResult> GetSubmissionDetail(Guid verificationId)
    {
        var verification = await _verificationRepo.FindByIdAsync(verificationId);
        if (verification == null) return NotFound();
        var owner = await _userRepo.FindByIdAsync(verification.OwnerId);

        var docRefs = new List<string> { verification.IdDocumentRef };
        if (!string.IsNullOrWhiteSpace(verification.SupportingDocsRef))
        {
            try { docRefs.AddRange(JsonSerializer.Deserialize<List<string>>(verification.SupportingDocsRef) ?? new()); } catch { }
        }
        var documentUrls = await _storage.RetrieveDocumentsAsync(docRefs);

        return Ok(new SubmissionDetailResponseDto
        {
            VerificationId = verification.VerificationId, OwnerId = verification.OwnerId,
            OwnerName = owner?.FullName ?? string.Empty, PersonalInformation = verification.PersonalInformation,
            IdDocumentRef = verification.IdDocumentRef, DocumentUrls = documentUrls,
            Status = verification.Status, SubmittedAt = verification.SubmittedAt, ReviewNote = verification.ReviewNote
        });
    }

    [HttpPost("{verificationId:guid}/approve")]
    public async Task<IActionResult> ApproveVerification(Guid verificationId, [FromBody] ReviewDecisionDto dto)
    {
        var verification = await _verificationRepo.FindByIdAsync(verificationId);
        if (verification == null) return NotFound();

        var validation = _logic.ValidateDecision(verification);
        if (!validation.IsValid) return BadRequest(new { Errors = validation.Errors });

        var result = verification.Approve(dto.ReviewNote);
        if (!result.Success) return BadRequest(new { Error = result.ErrorMessage });
        await _verificationRepo.UpdateAsync(verification);

        var owner = await _userRepo.FindByIdAsync(verification.OwnerId);
        if (owner != null)
            _email.SendAsync(new EmailMessage(owner.Email, "Verification Approved", "Your owner verification has been approved. You can now publish listings."));

        return Ok(new AdminDecisionResponseDto { Id = verificationId, NewStatus = verification.Status, Message = "Verification approved" });
    }

    [HttpPost("{verificationId:guid}/reject")]
    public async Task<IActionResult> RejectVerification(Guid verificationId, [FromBody] ReviewDecisionDto dto)
    {
        var verification = await _verificationRepo.FindByIdAsync(verificationId);
        if (verification == null) return NotFound();
        if (string.IsNullOrWhiteSpace(dto.ReviewNote)) return BadRequest(new { Error = "Review note required for rejection" });

        var validation = _logic.ValidateDecision(verification);
        if (!validation.IsValid) return BadRequest(new { Errors = validation.Errors });

        var result = verification.Reject(dto.ReviewNote!);
        if (!result.Success) return BadRequest(new { Error = result.ErrorMessage });
        await _verificationRepo.UpdateAsync(verification);

        var owner = await _userRepo.FindByIdAsync(verification.OwnerId);
        if (owner != null)
            _email.SendAsync(new EmailMessage(owner.Email, "Verification Rejected", $"Your verification was rejected. Reason: {dto.ReviewNote}"));

        return Ok(new AdminDecisionResponseDto { Id = verificationId, NewStatus = verification.Status, Message = "Verification rejected" });
    }
}
