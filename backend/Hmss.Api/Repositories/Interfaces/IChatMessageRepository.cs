using Hmss.Api.Entities;

namespace Hmss.Api.Repositories.Interfaces;

public interface IChatMessageRepository
{
    Task SaveAsync(ChatMessage message);
    Task SaveChangesAsync();
    Task<List<ChatMessage>> FindByRequestIdAsync(Guid requestId, int limit = 50);
    Task<List<ChatMessage>> FindByConversationIdAsync(Guid conversationId, int limit = 50);
}
