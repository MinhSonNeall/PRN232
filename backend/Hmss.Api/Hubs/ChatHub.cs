using Hmss.Api.Auth;
using Hmss.Api.DTOs.Chat;
using Hmss.Api.Entities;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Hmss.Api.Hubs;

/// <summary>
/// Real-time chat hub supporting both request-scoped and conversation-based messaging.
/// Each connected user is auto-added to a user-level group (user-{userId}) so they
/// can receive real-time notifications like ConversationListUpdated.
/// </summary>
[Authorize]
public class ChatHub : Hub
{
    private readonly IChatMessageRepository _chatRepo;
    private readonly IRentalRequestRepository _requestRepo;
    private readonly IConversationRepository _convRepo;

    public ChatHub(
        IChatMessageRepository chatRepo,
        IRentalRequestRepository requestRepo,
        IConversationRepository convRepo)
    {
        _chatRepo    = chatRepo;
        _requestRepo = requestRepo;
        _convRepo    = convRepo;
    }

    /// <summary>
    /// Auto-join the connecting user to their personal notification group.
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var userId = ClaimsHelper.GetUserId(Context.User!);
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        await base.OnConnectedAsync();
    }

    // ── Request-scoped methods (backward compat) ──

    /// <summary>
    /// Subscribe to a request's chat group. Must be called before SendMessage.
    /// </summary>
    public async Task JoinChat(string requestId)
    {
        if (!Guid.TryParse(requestId, out var rid))
            throw new HubException("Invalid requestId format");
        await AuthorizeRequestAccess(rid);
        await Groups.AddToGroupAsync(Context.ConnectionId, requestId);
    }

    /// <summary>
    /// Persists the message and broadcasts it to all group members (request-scoped).
    /// </summary>
    public async Task SendMessage(string requestId, string body)
    {
        if (!Guid.TryParse(requestId, out var rid))
            throw new HubException("Invalid requestId format");

        var senderId = ClaimsHelper.GetUserId(Context.User!);
        await AuthorizeRequestAccess(rid);

        var message = ChatMessage.Create(rid, senderId, body);
        await _chatRepo.SaveAsync(message);

        var senderLabel = ClaimsHelper.GetEmail(Context.User!) ?? "Unknown";
        var dto = new ChatMessageDto(
            message.MessageId, message.SenderId, senderLabel, message.Body, message.SentAt);

        await Clients.Group(requestId).SendAsync("ReceiveMessage", dto);
    }

    // ── Conversation-based methods (new) ──

    /// <summary>
    /// Subscribe to a conversation's chat group.
    /// </summary>
    public async Task JoinConversation(string conversationId)
    {
        if (!Guid.TryParse(conversationId, out var cid))
            throw new HubException("Invalid conversationId format");

        await AuthorizeConversationAccess(cid);
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conv-{conversationId}");
    }

    /// <summary>
    /// Persists and broadcasts a message within a conversation.
    /// Also notifies both participants' user groups to refresh their conversation list.
    /// </summary>
    public async Task SendConversationMessage(string conversationId, string body)
    {
        if (!Guid.TryParse(conversationId, out var cid))
            throw new HubException("Invalid conversationId format");

        var senderId = ClaimsHelper.GetUserId(Context.User!);
        await AuthorizeConversationAccess(cid);

        var message = ChatMessage.CreateForConversation(cid, senderId, body);
        await _chatRepo.SaveAsync(message);

        var senderLabel = ClaimsHelper.GetEmail(Context.User!) ?? "Unknown";
        var dto = new ChatMessageDto(
            message.MessageId, message.SenderId, senderLabel, message.Body, message.SentAt);

        await Clients.Group($"conv-{conversationId}").SendAsync("ReceiveMessage", dto);

        // Notify both participants to refresh their conversation list
        // and send a chat notification to the recipient (not the sender)
        var conv = await _convRepo.FindByIdAsync(cid);
        if (conv != null)
        {
            await Clients.Group($"user-{conv.OwnerId}").SendAsync("ConversationListUpdated");
            await Clients.Group($"user-{conv.TenantId}").SendAsync("ConversationListUpdated");

            var recipientId = conv.OwnerId == senderId ? conv.TenantId : conv.OwnerId;
            await Clients.Group($"user-{recipientId}").SendAsync("NewChatMessage", new
            {
                conversationId,
                senderName = senderLabel,
                body = body.Length > 100 ? body[..100] + "…" : body
            });
        }
    }

    // ── Private auth helpers ──

    private async Task AuthorizeRequestAccess(Guid requestId)
    {
        var callerId = ClaimsHelper.GetUserId(Context.User!);
        var request  = await _requestRepo.FindByIdWithPropertyAsync(requestId)
            ?? throw new HubException("Rental request not found");

        var ownerId = request.Listing?.Property?.OwnerId;
        if (request.TenantId != callerId && ownerId != callerId)
            throw new HubException("Access denied: you are not a participant of this request");
    }

    private async Task AuthorizeConversationAccess(Guid conversationId)
    {
        var callerId = ClaimsHelper.GetUserId(Context.User!);
        var conv = await _convRepo.FindByIdAsync(conversationId)
            ?? throw new HubException("Conversation not found");

        if (conv.OwnerId != callerId && conv.TenantId != callerId)
            throw new HubException("Access denied: you are not a participant of this conversation");
    }
}
