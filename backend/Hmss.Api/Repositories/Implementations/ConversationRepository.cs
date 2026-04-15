using Hmss.Api.Data;
using Hmss.Api.Entities;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hmss.Api.Repositories.Implementations;

/// <summary>
/// EF Core implementation for persisting and querying Conversation entities.
/// </summary>
public class ConversationRepository : IConversationRepository
{
    private readonly HmssDbContext _db;

    public ConversationRepository(HmssDbContext db) => _db = db;

    public async Task<Conversation?> FindByIdAsync(Guid conversationId) =>
        await _db.Conversations
            .Include(c => c.Owner)
            .Include(c => c.Tenant)
            .Include(c => c.Request)
            .FirstOrDefaultAsync(c => c.ConversationId == conversationId);

    /// <summary>
    /// Looks up an existing conversation by (OwnerId, TenantId, RequestId).
    /// Creates and saves a new one if no match found. Thread-safety for concurrent
    /// inserts is handled by the unique index on the table; callers should retry on
    /// DbUpdateException if racing inserts occur.
    /// </summary>
    public async Task<Conversation> FindOrCreateAsync(Guid ownerId, Guid tenantId, Guid? requestId = null)
    {
        // Build query — EF translates nullable comparisons correctly
        var existing = await _db.Conversations
            .Include(c => c.Owner)
            .Include(c => c.Tenant)
            .Include(c => c.Request)
            .FirstOrDefaultAsync(c =>
                c.OwnerId   == ownerId   &&
                c.TenantId  == tenantId  &&
                c.RequestId == requestId);

        if (existing is not null)
            return existing;

        var conversation = Conversation.Create(ownerId, tenantId, requestId);
        _db.Conversations.Add(conversation);
        await _db.SaveChangesAsync();
        return conversation;
    }

    public async Task<Conversation?> FindByRequestIdAsync(Guid requestId) =>
        await _db.Conversations
            .Include(c => c.Owner)
            .Include(c => c.Tenant)
            .Include(c => c.Request)
            .FirstOrDefaultAsync(c => c.RequestId == requestId);

    public async Task<List<Conversation>> FindByOwnerIdAsync(Guid ownerId) =>
        await _db.Conversations
            .Include(c => c.Owner)
            .Include(c => c.Tenant)
            .Include(c => c.Request)
            .Where(c => c.OwnerId == ownerId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

    public async Task<List<Conversation>> FindByTenantIdAsync(Guid tenantId) =>
        await _db.Conversations
            .Include(c => c.Owner)
            .Include(c => c.Tenant)
            .Include(c => c.Request)
            .Where(c => c.TenantId == tenantId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

    public async Task<Conversation?> FindByPairAsync(Guid ownerId, Guid tenantId) =>
        await _db.Conversations
            .Include(c => c.Owner)
            .Include(c => c.Tenant)
            .Include(c => c.Request)
            .FirstOrDefaultAsync(c => c.OwnerId == ownerId && c.TenantId == tenantId);

    public async Task<List<Conversation>> FindByParticipantAsync(Guid userId) =>
        await _db.Conversations
            .Include(c => c.Owner)
            .Include(c => c.Tenant)
            .Include(c => c.Request)
            .Where(c => c.OwnerId == userId || c.TenantId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
}
