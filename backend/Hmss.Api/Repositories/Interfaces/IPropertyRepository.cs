using Hmss.Api.Entities;
namespace Hmss.Api.Repositories.Interfaces;
public interface IPropertyRepository
{
    Task<Property> SaveAsync(Property entity);
    Task<Property?> FindByIdAsync(Guid propertyId);
    Task<List<Property>> FindByOwnerIdAsync(Guid ownerId);
    Task<Property> UpdateAsync(Property entity);
}
