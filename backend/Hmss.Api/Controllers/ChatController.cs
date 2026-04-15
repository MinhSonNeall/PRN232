using Hmss.Api.Auth;
using Hmss.Api.DTOs.Chat;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hmss.Api.Controllers;

/// <summary>
/// REST endpoints for chat history and conversation management.
/// Real-time messaging is handled by ChatHub (SignalR).
/// </summary>
[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatMessageRepository _chatRepo;
    private readonly IRentalRequestRepository _requestRepo;
    private readonly IConversationRepository _convRepo;

    public ChatController(
        IChatMessageRepository chatRepo,
        IRentalRequestRepository requestRepo,
        IConversationRepository convRepo)
    {
        _chatRepo    = chatRepo;
        _requestRepo = requestRepo;
        _convRepo    = convRepo;
    }

    // ── Legacy request-scoped endpoint (backward compat) ──

    /// <summary>
    /// Returns the last 50 messages for a rental request.
    /// </summary>
    [HttpGet("{requestId:guid}/history")]
    public async Task<IActionResult> GetHistory(Guid requestId)
    {
        var callerId = ClaimsHelper.GetUserId(User);
        var request = await _requestRepo.FindByIdWithPropertyAsync(requestId);
        if (request == null) return NotFound();

        var ownerId = request.Listing?.Property?.OwnerId;
        if (request.TenantId != callerId && ownerId != callerId) return Forbid();

        var messages = await _chatRepo.FindByRequestIdAsync(requestId, limit: 50);
        var dtos = messages.Select(m => new ChatMessageDto(
            m.MessageId, m.SenderId, m.Sender.FullName, m.Body, m.SentAt));

        return Ok(dtos);
    }

    // ── Conversation-based endpoints ──

    /// <summary>
    /// List all conversations for the current user, with last message and category.
    /// </summary>
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var callerId = ClaimsHelper.GetUserId(User);
        var role = ClaimsHelper.GetRole(User);

        var conversations = await _convRepo.FindByParticipantAsync(callerId);

        var result = new List<ConversationListItemDto>();
        foreach (var conv in conversations)
        {
            // Get last message for preview
            var lastMessages = await _chatRepo.FindByConversationIdAsync(conv.ConversationId, limit: 1);
            var lastMsg = lastMessages.FirstOrDefault();

            // Determine the other party based on caller's role
            var isOwner = conv.OwnerId == callerId;
            var otherPartyId = isOwner ? conv.TenantId : conv.OwnerId;
            var otherPartyName = isOwner
                ? (conv.Tenant?.FullName ?? "Unknown Tenant")
                : (conv.Owner?.FullName ?? "Unknown Owner");

            // Categorize: use linked request first, then cross-reference any request between the pair
            var category = "Inquiry";
            string? requestStatus = conv.Request?.Status;
            string? listingTitle  = conv.Request?.Listing?.Title;

            if (conv.Request != null)
            {
                category = conv.Request.Status switch
                {
                    "Accepted" => "CurrentTenant",
                    "Pending"  => "PendingRequest",
                    _          => "Inquiry"
                };
            }
            else
            {
                // No linked request — check if any request exists between this owner-tenant pair
                var bestRequest = await _requestRepo.FindBestByOwnerAndTenantAsync(conv.OwnerId, conv.TenantId);
                if (bestRequest != null)
                {
                    requestStatus = bestRequest.Status;
                    listingTitle  = bestRequest.Listing?.Title;
                    category = bestRequest.Status switch
                    {
                        "Accepted" => "CurrentTenant",
                        "Pending"  => "PendingRequest",
                        _          => "Inquiry"
                    };
                }
            }

            result.Add(new ConversationListItemDto
            {
                ConversationId = conv.ConversationId,
                OtherPartyId = otherPartyId,
                OtherPartyName = otherPartyName,
                RequestId = conv.RequestId,
                RequestStatus = requestStatus,
                ListingTitle = listingTitle,
                LastMessageBody = lastMsg?.Body,
                LastMessageAt = lastMsg?.SentAt,
                Category = category
            });
        }

        // Sort by last message time (most recent first)
        result = result.OrderByDescending(c => c.LastMessageAt ?? DateTime.MinValue).ToList();
        return Ok(result);
    }

    /// <summary>
    /// Get message history for a conversation.
    /// </summary>
    [HttpGet("conversations/{conversationId:guid}/history")]
    public async Task<IActionResult> GetConversationHistory(Guid conversationId)
    {
        var callerId = ClaimsHelper.GetUserId(User);
        var conv = await _convRepo.FindByIdAsync(conversationId);
        if (conv == null) return NotFound();
        if (conv.OwnerId != callerId && conv.TenantId != callerId) return Forbid();

        var messages = await _chatRepo.FindByConversationIdAsync(conversationId, limit: 50);
        var dtos = messages.Select(m => new ChatMessageDto(
            m.MessageId, m.SenderId, m.Sender.FullName, m.Body, m.SentAt));

        return Ok(dtos);
    }

    /// <summary>
    /// Start or find an existing conversation with another user.
    /// Idempotent: returns existing conversation if one already exists for the pair.
    /// </summary>
    [HttpPost("conversations/start")]
    public async Task<IActionResult> StartConversation([FromBody] StartConversationRequest request)
    {
        var callerId = ClaimsHelper.GetUserId(User);
        var role = ClaimsHelper.GetRole(User);

        Guid ownerId, tenantId;
        if (role == "Tenant")
        {
            ownerId = request.OtherPartyId;
            tenantId = callerId;
        }
        else if (role == "Owner")
        {
            ownerId = callerId;
            tenantId = request.OtherPartyId;
        }
        else
        {
            return BadRequest("Only Tenant and Owner roles can start conversations");
        }

        // Find ANY existing conversation between the pair first
        var existing = await _convRepo.FindByPairAsync(ownerId, tenantId);
        if (existing != null)
            return Ok(new { existing.ConversationId });

        var conv = await _convRepo.FindOrCreateAsync(ownerId, tenantId);
        return Ok(new { conv.ConversationId });
    }

    /// <summary>
    /// Find or create a conversation for a rental request's owner-tenant pair.
    /// Used by the request detail page to bridge legacy request-scoped chat
    /// into the unified conversation system.
    /// </summary>
    [HttpPost("conversations/from-request/{requestId:guid}")]
    public async Task<IActionResult> ConversationFromRequest(Guid requestId)
    {
        var callerId = ClaimsHelper.GetUserId(User);
        var request = await _requestRepo.FindByIdWithPropertyAsync(requestId);
        if (request == null) return NotFound();

        var ownerId = request.Listing?.Property?.OwnerId ?? Guid.Empty;
        if (request.TenantId != callerId && ownerId != callerId) return Forbid();

        // Find any existing conversation for this pair
        var existing = await _convRepo.FindByPairAsync(ownerId, request.TenantId);
        if (existing != null)
            return Ok(new { existing.ConversationId });

        // Create one linked to this request
        var conv = await _convRepo.FindOrCreateAsync(ownerId, request.TenantId, requestId);

        // Backfill: link existing request-scoped messages to the new conversation
        var legacyMessages = await _chatRepo.FindByRequestIdAsync(requestId, limit: 500);
        foreach (var msg in legacyMessages.Where(m => m.ConversationId == null))
        {
            msg.SetConversationId(conv.ConversationId);
        }
        if (legacyMessages.Any(m => m.ConversationId == conv.ConversationId))
        {
            await _chatRepo.SaveChangesAsync();
        }

        return Ok(new { conv.ConversationId });
    }
}

public class StartConversationRequest
{
    public Guid OtherPartyId { get; set; }
}
