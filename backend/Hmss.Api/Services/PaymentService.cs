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
        _clientId = payOSConfig["ClientId"] ?? "";
        _apiKey = payOSConfig["ApiKey"] ?? "";
        _checksumKey = payOSConfig["ChecksumKey"] ?? "";
        _baseUrl = payOSConfig["BaseUrl"] ?? "https://api-merchant.payos.vn";
        
        _returnUrl = payOSConfig["ReturnUrl"] ?? "http://localhost:3000/payment/success";
        _cancelUrl = payOSConfig["CancelUrl"] ?? "http://localhost:3000/payment/cancel";
    }

    private bool IsConfigured => !string.IsNullOrEmpty(_clientId) && !string.IsNullOrEmpty(_apiKey) && !string.IsNullOrEmpty(_checksumKey);

    private string CreateSignature(Dictionary<string, object> data)
    {
        var sortedKeys = data.Keys.OrderBy(k => k).ToList();
        var signData = string.Join("&", sortedKeys.Select(k => $"{k}={data[k]}"));
        using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(_checksumKey));
        var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(signData));
        return Convert.ToHexString(hash).ToLower();
    }

    public async Task<(string checkoutUrl, Payment payment)> CreatePaymentLinkAsync(Guid requestId, string? method = null)
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
        var paymentMethod = method?.ToLower() ?? "payos";

        string checkoutUrl;

        if (!IsConfigured)
        {
            checkoutUrl = $"http://localhost:3000/payment/success?orderCode={orderCode}&amount={(long)listing.Price}&method={paymentMethod}";
        }
        else if (paymentMethod == "vnpay")
        {
            checkoutUrl = await CreateVNPayLinkAsync(request, orderCode, listing.Price);
        }
        else if (paymentMethod == "momo")
        {
            checkoutUrl = await CreateMoMoLinkAsync(request, orderCode, listing.Price);
        }
        else
        {
            checkoutUrl = await CreatePayOSLinkAsync(request, orderCode, listing.Price);
        }

        var payment = Payment.Create(requestId, orderCode, listing.Price);
        await _paymentRepo.SaveAsync(payment);

        return (checkoutUrl, payment);
    }

    private async Task<string> CreatePayOSLinkAsync(RentalRequest request, long orderCode, decimal amount)
    {
        var paymentData = new Dictionary<string, object>
        {
            { "orderCode", orderCode },
            { "amount", (long)amount },
            { "description", $"Thanh toan dat phong {request.Listing?.Title}" },
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
        return responseData.GetProperty("data").GetProperty("checkoutUrl").GetString() ?? "";
    }

    private async Task<string> CreateVNPayLinkAsync(RentalRequest request, long orderCode, decimal amount)
    {
        var vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        var vnpTmnCode = Environment.GetEnvironmentVariable("VNP_TMNCODE") ?? "TEST";
        var vnpHashSecret = Environment.GetEnvironmentVariable("VNP_HASHSECRET") ?? "TEST";
        var vnpReturnUrl = Environment.GetEnvironmentVariable("VNP_RETURNURL") ?? _returnUrl;

        var vnpParams = new SortedDictionary<string, string>
        {
            { "vnp_Amount", ((long)amount * 100).ToString() },
            { "vnp_Command", "pay" },
            { "vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss") },
            { "vnp_CurrCode", "VND" },
            { "vnp_Email", request.Tenant?.Email ?? "" },
            { "vnp_ExpireDate", DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss") },
            { "vnp_IpAddr", "127.0.0.1" },
            { "vnp_Locale", "vn" },
            { "vnp_Merchant", vnpTmnCode },
            { "vnp_OrderInfo", $"Thanh toan dat phong {request.Listing?.Title}" },
            { "vnp_OrderType", "other" },
            { "vnp_ReturnUrl", vnpReturnUrl },
            { "vnp_TxnRef", orderCode.ToString() },
            { "vnp_Version", "2.1.0" }
        };

        var signData = string.Join("&", vnpParams.Select(kvp => $"{kvp.Key}={kvp.Value}"));
        using var hmac = System.Security.Cryptography.HMACSHA256.Create();
        hmac.Key = System.Text.Encoding.UTF8.GetBytes(vnpHashSecret);
        var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(signData));
        var vnpSecureHash = Convert.ToHexString(hash).ToLower();
        vnpParams.Add("vnp_SecureHash", vnpSecureHash);

        var query = string.Join("&", vnpParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
        return $"{vnpUrl}?{query}";
    }

    private async Task<string> CreateMoMoLinkAsync(RentalRequest request, long orderCode, decimal amount)
    {
        var partnerCode = Environment.GetEnvironmentVariable("MOMO_PARTNERCODE") ?? "MOMO";
        var secretKey = Environment.GetEnvironmentVariable("MOMO_SECRETKEY") ?? "TEST";
        var returnUrl = Environment.GetEnvironmentVariable("MOMO_RETURNURL") ?? _returnUrl;

        var momoParams = new Dictionary<string, object>
        {
            { "partnerCode", partnerCode },
            { "partnerClientId", orderCode.ToString() },
            { "amount", (long)amount },
            { "description", $"Thanh toan dat phong {request.Listing?.Title}" },
            { "returnUrl", returnUrl },
            { "ipnUrl", returnUrl },
            { "requestId", orderCode.ToString() },
            { "requestType", "captureWallet" }
        };

        var signData = $"amount={momoParams["amount"]}&description={momoParams["description"]}&partnerCode={partnerCode}&partnerClientId={orderCode}&requestId={orderCode}";
        using var hmac = System.Security.Cryptography.HMACSHA256.Create();
        hmac.Key = System.Text.Encoding.UTF8.GetBytes(secretKey);
        var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(signData));
        momoParams["signature"] = Convert.ToHexString(hash).ToLower();

        var content = new StringContent(JsonSerializer.Serialize(momoParams), System.Text.Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("https://test-payment.momo.vn/v2/gateway/api/create", content);
        
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException("MoMo API error");
        }

        var responseData = JsonSerializer.Deserialize<JsonElement>(await response.Content.ReadAsStringAsync());
        return responseData.GetProperty("payUrl").GetString() ?? "";
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
