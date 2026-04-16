using Hmss.Api.Auth;
using Hmss.Api.DTOs.Payment;
using Hmss.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/payment")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly PaymentService _paymentService;

    public PaymentController(PaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("create-link/{requestId:guid}")]
    public async Task<IActionResult> CreatePaymentLink(Guid requestId)
    {
        try
        {
            var (checkoutUrl, payment) = await _paymentService.CreatePaymentLinkAsync(requestId);
            return Ok(new PaymentLinkResponseDto
            {
                PaymentId = payment.PaymentId,
                CheckoutUrl = checkoutUrl,
                Amount = payment.Amount,
                Status = payment.Status
            });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("by-request/{requestId:guid}")]
    public async Task<IActionResult> GetPaymentByRequest(Guid requestId)
    {
        var payment = await _paymentService.GetPaymentByRequestIdAsync(requestId);
        if (payment == null)
            return NotFound(new { Error = "Payment not found" });

        return Ok(new PaymentStatusResponseDto
        {
            PaymentId = payment.PaymentId,
            RequestId = payment.RequestId,
            Amount = payment.Amount,
            Status = payment.Status,
            PaidAt = payment.PaidAt,
            PaymentMethod = payment.PaymentMethod
        });
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> HandleWebhook([FromBody] PayOSWebhookDto webhookData)
    {
        try
        {
            var payment = await _paymentService.ProcessWebhookAsync(
                webhookData.OrderCode,
                webhookData.Status,
                webhookData.PaymentMethod,
                webhookData.TransactionId);

            if (payment == null)
                return NotFound(new { Error = "Payment not found" });

            return Ok(new { Message = "Webhook processed successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}
