using Hmss.Api.Data;
using Hmss.Api.Entities;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hmss.Api.Repositories.Implementations;

/// <summary>
/// EF Core implementation for persisting and querying chat messages.
/// </summary>
public class ChatMessageRepository : IChatMessageRepository
{
    private readonly HmssDbContext _db;

    public ChatMessageRepository(HmssDbContext db) => _db = db;

    public async Task SaveAsync(ChatMessage message)
    {
        _db.ChatMessages.Add(message);
        await _db.SaveChangesAsync();
    }

    public async Task SaveChangesAsync() => await _db.SaveChangesAsync();

    /// <summary>
    /// Returns up to <paramref name="limit"/> messages for the given request,
    /// ordered oldest-first, with Sender navigation loaded.
    /// </summary>
    public async Task<List<ChatMessage>> FindByRequestIdAsync(Guid requestId, int limit = 50) =>
        await _db.ChatMessages
            .Include(m => m.Sender)
            .Where(m => m.RequestId == requestId)
            .OrderByDescending(m => m.SentAt)
            .Take(limit)
            .OrderBy(m => m.SentAt)       // re-order ascending for display
            .ToListAsync();

    /// <summary>
    /// Returns up to <paramref name="limit"/> messages for the given conversation,
    /// ordered oldest-first, with Sender navigation loaded.
    /// </summary>
    public async Task<List<ChatMessage>> FindByConversationIdAsync(Guid conversationId, int limit = 50) =>
        await _db.ChatMessages
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.SentAt)
            .Take(limit)
            .OrderBy(m => m.SentAt)       // re-order ascending for display
            .ToListAsync();
}
