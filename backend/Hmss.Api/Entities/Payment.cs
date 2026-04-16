namespace Hmss.Api.Entities;

public class Payment
{
    public Guid PaymentId { get; private set; }
    public Guid RequestId { get; private set; }
    public long PayOSOrderCode { get; private set; }
    public decimal Amount { get; private set; }
    public string Status { get; private set; } = "Pending"; // Pending|Paid|Cancelled|Failed
    public string? PaymentMethod { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? PaidAt { get; private set; }
    public string? TransactionId { get; private set; }

    public RentalRequest? Request { get; private set; }

    private Payment() { }

    public static Payment Create(Guid requestId, long payOSOrderCode, decimal amount)
    {
        return new Payment
        {
            PaymentId = Guid.NewGuid(),
            RequestId = requestId,
            PayOSOrderCode = payOSOrderCode,
            Amount = amount,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };
    }

    public void MarkAsPaid(string? paymentMethod, string? transactionId)
    {
        Status = "Paid";
        PaidAt = DateTime.UtcNow;
        PaymentMethod = paymentMethod;
        TransactionId = transactionId;
    }

    public void MarkAsFailed()
    {
        Status = "Failed";
    }

    public void Cancel()
    {
        Status = "Cancelled";
    }
}
