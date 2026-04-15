using Hmss.Api.Entities;

namespace Hmss.Api.Repositories.Interfaces;

public interface IConversationRepository
{
    Task<Conversation?> FindByIdAsync(Guid conversationId);

    /// <summary>
    /// Returns existing conversation matching (ownerId, tenantId, requestId),
    /// or creates and persists a new one if none exists.
    /// </summary>
    Task<Conversation> FindOrCreateAsync(Guid ownerId, Guid tenantId, Guid? requestId = null);

    Task<Conversation?> FindByRequestIdAsync(Guid requestId);
    Task<List<Conversation>> FindByOwnerIdAsync(Guid ownerId);
    Task<List<Conversation>> FindByTenantIdAsync(Guid tenantId);

    /// <summary>
    /// Returns the first conversation between the given owner-tenant pair (any RequestId).
    /// </summary>
    Task<Conversation?> FindByPairAsync(Guid ownerId, Guid tenantId);

    /// <summary>
    /// Returns all conversations where the user is either owner or tenant.
    /// </summary>
    Task<List<Conversation>> FindByParticipantAsync(Guid userId);
}
