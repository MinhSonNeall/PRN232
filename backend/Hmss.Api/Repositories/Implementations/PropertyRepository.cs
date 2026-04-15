using Hmss.Api.Data;
using Hmss.Api.Entities;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hmss.Api.Repositories.Implementations;

public class PropertyRepository : IPropertyRepository
{
    private readonly HmssDbContext _db;
    public PropertyRepository(HmssDbContext db) => _db = db;

    public async Task<Property> SaveAsync(Property entity) { _db.Properties.Add(entity); await _db.SaveChangesAsync(); return entity; }
    public async Task<Property?> FindByIdAsync(Guid id) => await _db.Properties.FindAsync(id);
    public async Task<List<Property>> FindByOwnerIdAsync(Guid ownerId) => await _db.Properties.Where(x => x.OwnerId == ownerId).ToListAsync();
    public async Task<Property> UpdateAsync(Property entity) { _db.Properties.Update(entity); await _db.SaveChangesAsync(); return entity; }
}
