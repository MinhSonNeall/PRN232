using Hmss.Api.Data;
using Hmss.Api.Entities;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hmss.Api.Repositories.Implementations;

public class OwnerVerificationRepository : IOwnerVerificationRepository
{
    private readonly HmssDbContext _db;
    public OwnerVerificationRepository(HmssDbContext db) => _db = db;

    public async Task<OwnerVerification> SaveAsync(OwnerVerification entity) { _db.OwnerVerifications.Add(entity); await _db.SaveChangesAsync(); return entity; }
    public async Task<OwnerVerification?> FindByIdAsync(Guid id) => await _db.OwnerVerifications.FindAsync(id);
    public async Task<List<OwnerVerification>> FindPendingAsync() =>
        await _db.OwnerVerifications.Where(x => x.Status == "PendingReview").ToListAsync();
    public async Task<OwnerVerification> UpdateAsync(OwnerVerification entity) { _db.OwnerVerifications.Update(entity); await _db.SaveChangesAsync(); return entity; }
    public async Task<bool> IsOwnerVerifiedAsync(Guid ownerId) =>
        await _db.OwnerVerifications.AnyAsync(x => x.OwnerId == ownerId && x.Status == "Verified");
}
