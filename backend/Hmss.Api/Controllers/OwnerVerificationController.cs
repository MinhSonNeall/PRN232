using Hmss.Api.Auth;
using Hmss.Api.DTOs.Verification;
using Hmss.Api.Entities;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Logic;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/verification")]
[Authorize(Policy = "OwnerOnly")]
public class OwnerVerificationController : ControllerBase
{
    private readonly IOwnerVerificationRepository _verificationRepo;
    private readonly ICloudStorageGateway _storage;
    private readonly VerificationLogic _logic;

    public OwnerVerificationController(IOwnerVerificationRepository verificationRepo, ICloudStorageGateway storage, VerificationLogic logic)
    {
        _verificationRepo = verificationRepo;
        _storage = storage;
        _logic = logic;
    }

    [HttpGet("form")]
    public async Task<IActionResult> GetVerificationForm()
    {
        var ownerId = ClaimsHelper.GetUserId(User);
        var isVerified = await _verificationRepo.IsOwnerVerifiedAsync(ownerId);
        var pending = (await _verificationRepo.FindPendingAsync()).Any(v => v.OwnerId == ownerId);
        var status = isVerified ? "Verified" : pending ? "PendingReview" : "Unverified";
        return Ok(new VerificationFormDto { CurrentStatus = status });
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessVerificationDetails([FromForm] string? personalInformation, IFormFileCollection documents)
    {
        if (documents.Count == 0) return BadRequest(new { Error = "At least one document is required" });
        var documentUrls = await _storage.UploadDocumentsAsync(documents);
        return Ok(new ProcessVerificationResponseDto { DocumentUrls = documentUrls, PreviewInfo = $"{documentUrls.Count} document(s) uploaded" });
    }

    [HttpPost]
    public async Task<IActionResult> SubmitVerification([FromBody] VerificationDraftDto request)
    {
        var validation = _logic.ValidateRequiredFields(request);
        if (!validation.IsValid) return BadRequest(new { Errors = validation.Errors });

        var ownerId = ClaimsHelper.GetUserId(User);
        var supportingJson = request.SupportingDocUrls?.Count > 0 ? JsonSerializer.Serialize(request.SupportingDocUrls) : null;
        var verification = OwnerVerification.Create(ownerId, request.PersonalInformation, request.IdDocumentUrl, supportingJson);
        var saved = await _verificationRepo.SaveAsync(verification);

        return Created($"/api/verification/{saved.VerificationId}",
            new VerificationSubmissionResponseDto { VerificationId = saved.VerificationId, Status = saved.Status, Message = "Verification submitted for review" });
    }
}
