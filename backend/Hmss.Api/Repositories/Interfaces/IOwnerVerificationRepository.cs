using Hmss.Api.Entities;
namespace Hmss.Api.Repositories.Interfaces;
public interface IOwnerVerificationRepository
{
    Task<OwnerVerification> SaveAsync(OwnerVerification entity);
    Task<OwnerVerification?> FindByIdAsync(Guid verificationId);
    Task<List<OwnerVerification>> FindPendingAsync();
    Task<OwnerVerification> UpdateAsync(OwnerVerification entity);
    Task<bool> IsOwnerVerifiedAsync(Guid ownerId);
}
