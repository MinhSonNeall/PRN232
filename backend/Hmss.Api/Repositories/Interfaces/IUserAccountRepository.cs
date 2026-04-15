using Hmss.Api.Entities;

namespace Hmss.Api.Repositories.Interfaces;

public interface IUserAccountRepository
{
    Task<UserAccount?> FindByEmailAsync(string email);
    Task<UserAccount> SaveAsync(UserAccount entity);
    Task<UserAccount?> FindByIdAsync(Guid userId);
    Task<List<UserAccount>> FindManageableUserAccountsAsync(); // Excludes SystemAdmin
    Task<UserAccount> UpdateAsync(UserAccount entity);
}
