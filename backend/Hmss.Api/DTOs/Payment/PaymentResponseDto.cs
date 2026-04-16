namespace Hmss.Api.DTOs.Payment;

public class PaymentLinkResponseDto
{
    public Guid PaymentId { get; set; }
    public string CheckoutUrl { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class PaymentStatusResponseDto
{
    public Guid PaymentId { get; set; }
    public Guid RequestId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? PaidAt { get; set; }
    public string? PaymentMethod { get; set; }
}

public class PayOSWebhookDto
{
    public long OrderCode { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public string? Signature { get; set; }
}
