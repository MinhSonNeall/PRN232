using Hmss.Api.Data;
using Hmss.Api.Entities;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hmss.Api.Repositories.Implementations;

public class UserAccountRepository : IUserAccountRepository
{
    private readonly HmssDbContext _db;
    public UserAccountRepository(HmssDbContext db) => _db = db;

    public async Task<UserAccount?> FindByEmailAsync(string email) =>
        await _db.UserAccounts.FirstOrDefaultAsync(x => x.Email == email);

    public async Task<UserAccount> SaveAsync(UserAccount entity)
    {
        _db.UserAccounts.Add(entity);
        await _db.SaveChangesAsync();
        return entity;
    }

    public async Task<UserAccount?> FindByIdAsync(Guid userId) =>
        await _db.UserAccounts.FindAsync(userId);

    public async Task<List<UserAccount>> FindManageableUserAccountsAsync() =>
        await _db.UserAccounts.Where(x => x.Role != "SystemAdmin").ToListAsync();

    public async Task<UserAccount> UpdateAsync(UserAccount entity)
    {
        _db.UserAccounts.Update(entity);
        await _db.SaveChangesAsync();
        return entity;
    }
}
