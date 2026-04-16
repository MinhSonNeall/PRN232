using Hmss.Api.Entities;

namespace Hmss.Api.Repositories.Interfaces;

public interface IPaymentRepository
{
    Task<Payment> SaveAsync(Payment entity);
    Task<Payment?> FindByIdAsync(Guid paymentId);
    Task<Payment?> FindByRequestIdAsync(Guid requestId);
    Task<Payment?> FindByOrderCodeAsync(long orderCode);
    Task<Payment> UpdateAsync(Payment entity);
}
