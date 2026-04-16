using Hmss.Api.Data;
using Hmss.Api.Entities;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hmss.Api.Repositories.Implementations;

public class PaymentRepository : IPaymentRepository
{
    private readonly HmssDbContext _db;

    public PaymentRepository(HmssDbContext db) => _db = db;

    public async Task<Payment> SaveAsync(Payment entity)
    {
        _db.Payments.Add(entity);
        await _db.SaveChangesAsync();
        return entity;
    }

    public async Task<Payment?> FindByIdAsync(Guid paymentId) =>
        await _db.Payments.FindAsync(paymentId);

    public async Task<Payment?> FindByRequestIdAsync(Guid requestId) =>
        await _db.Payments.FirstOrDefaultAsync(x => x.RequestId == requestId);

    public async Task<Payment?> FindByOrderCodeAsync(long orderCode) =>
        await _db.Payments.FirstOrDefaultAsync(x => x.PayOSOrderCode == orderCode);

    public async Task<Payment> UpdateAsync(Payment entity)
    {
        _db.Payments.Update(entity);
        await _db.SaveChangesAsync();
        return entity;
    }
}
