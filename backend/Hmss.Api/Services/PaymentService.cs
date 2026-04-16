using System.Text.Json;
using Hmss.Api.Entities;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.WebUtilities;

namespace Hmss.Api.Services;

public class PaymentService
{
    private readonly IPaymentRepository _paymentRepo;
    private readonly IRentalRequestRepository _requestRepo;
    private readonly HttpClient _httpClient;
    private readonly string _clientId;
    private readonly string _apiKey;
    private readonly string _checksumKey;
    private readonly string _baseUrl;
    private readonly string _returnUrl;
    private readonly string _cancelUrl;

    public PaymentService(
        IPaymentRepository paymentRepo,
        IRentalRequestRepository requestRepo,
        IConfiguration configuration)
    {
        _paymentRepo = paymentRepo;
        _requestRepo = requestRepo;
        _httpClient = new HttpClient();

        var payOSConfig = configuration.GetSection("PayOS");
        _clientId = payOSConfig["ClientId"] ?? throw new InvalidOperationException("PayOS ClientId not configured");
        _apiKey = payOSConfig["ApiKey"] ?? throw new InvalidOperationException("PayOS ApiKey not configured");
        _checksumKey = payOSConfig["ChecksumKey"] ?? throw new InvalidOperationException("PayOS ChecksumKey not configured");
        _baseUrl = payOSConfig["BaseUrl"] ?? "https://api-merchant.payos.vn";
        
        _returnUrl = payOSConfig["ReturnUrl"] ?? "http://localhost:3000/payment/success";
        _cancelUrl = payOSConfig["CancelUrl"] ?? "http://localhost:3000/payment/cancel";
    }

    private string CreateSignature(Dictionary<string, object> data)
    {
        var sortedKeys = data.Keys.OrderBy(k => k).ToList();
        var signData = string.Join("&", sortedKeys.Select(k => $"{k}={data[k]}"));
        using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(_checksumKey));
        var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(signData));
        return Convert.ToHexString(hash).ToLower();
    }

    public async Task<(string checkoutUrl, Payment payment)> CreatePaymentLinkAsync(Guid requestId)
    {
        var request = await _requestRepo.FindByIdWithPropertyAsync(requestId);
        if (request == null)
            throw new ArgumentException("Rental request not found");

        if (request.Status != "Accepted")
            throw new InvalidOperationException("Only accepted requests can proceed to payment");

        var listing = request.Listing;
        if (listing == null)
            throw new InvalidOperationException("Listing not found");

        var orderCode = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        
        var paymentData = new Dictionary<string, object>
        {
            { "orderCode", orderCode },
            { "amount", (long)listing.Price },
            { "description", $"Thanh toan dat phong {listing.Title}" },
            { "returnUrl", _returnUrl },
            { "cancelUrl", _cancelUrl },
            { "buyerName", request.Tenant?.FullName ?? "Khach hang" },
            { "buyerEmail", request.Tenant?.Email ?? "" },
            { "buyerPhone", request.ContactPhone }
        };

        paymentData["signature"] = CreateSignature(paymentData);

        var content = new StringContent(JsonSerializer.Serialize(paymentData), System.Text.Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync($"{_baseUrl}/v2/payment-requests", content);
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"PayOS API error: {error}");
        }

        var responseData = JsonSerializer.Deserialize<JsonElement>(await response.Content.ReadAsStringAsync());
        var checkoutUrl = responseData.GetProperty("data").GetProperty("checkoutUrl").GetString();

        var payment = Payment.Create(requestId, orderCode, listing.Price);
        await _paymentRepo.SaveAsync(payment);

        return (checkoutUrl ?? "", payment);
    }

    public async Task<Payment?> ProcessWebhookAsync(long orderCode, string status, string? paymentMethod, string? transactionId)
    {
        var payment = await _paymentRepo.FindByOrderCodeAsync(orderCode);
        if (payment == null) return null;

        if (status == "PAID")
        {
            payment.MarkAsPaid(paymentMethod, transactionId);
            await _paymentRepo.UpdateAsync(payment);

            var request = await _requestRepo.FindByIdAsync(payment.RequestId);
            if (request != null)
            {
                request.MarkPaymentAsPaid();
                await _requestRepo.UpdateAsync(request);
            }
        }
        else if (status == "CANCELLED")
        {
            payment.Cancel();
            await _paymentRepo.UpdateAsync(payment);
        }

        return payment;
    }

    public async Task<Payment?> GetPaymentByRequestIdAsync(Guid requestId)
    {
        return await _paymentRepo.FindByRequestIdAsync(requestId);
    }

    public async Task<bool> CancelPaymentLinkAsync(long orderCode)
    {
        try
        {
            var payment = await _paymentRepo.FindByOrderCodeAsync(orderCode);
            if (payment == null) return false;

            var cancelData = new Dictionary<string, object>
            {
                { "orderCode", orderCode }
            };
            cancelData["signature"] = CreateSignature(cancelData);

            var content = new StringContent(JsonSerializer.Serialize(cancelData), System.Text.Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{_baseUrl}/v2/payment-requests/{orderCode}/cancel", content);
            
            payment.Cancel();
            await _paymentRepo.UpdateAsync(payment);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
