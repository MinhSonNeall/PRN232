using Hmss.Api.Auth;
using Hmss.Api.DTOs.Auth;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserAccountRepository _userRepo;
    private readonly JwtTokenService _jwtService;
    private readonly JwtConfig _jwtConfig;
    private readonly IMemoryCache _cache;
    private readonly IEmailGateway _email;

    public AuthController(
        IUserAccountRepository userRepo, JwtTokenService jwtService,
        IOptions<JwtConfig> jwtConfig, IMemoryCache cache, IEmailGateway email)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
        _jwtConfig = jwtConfig.Value;
        _cache = cache;
        _email = email;
    }

    [HttpPost("login")]
    public async Task<IActionResult> SignIn([FromBody] SignInRequestDto request)
    {
        var account = await _userRepo.FindByEmailAsync(request.Email);
        if (account == null || !BCrypt.Net.BCrypt.Verify(request.Password, account.PasswordHash))
            return Unauthorized(new { Message = "Invalid email or password" });

        if (account.AccountStatus == "Disabled")
            return Unauthorized(new { Message = "Your account has been disabled. Please contact support." });

        if (account.AccountStatus == "Suspended")
            return Unauthorized(new { Message = "Your account has been suspended. Please contact support." });

        // SystemAdmin requires 2FA email verification
        if (account.Role == "SystemAdmin")
        {
            var code = Random.Shared.Next(100000, 999999).ToString();
            var cacheKey = $"admin-2fa-{account.UserId}";
            _cache.Set(cacheKey, code, TimeSpan.FromMinutes(5));

            _email.SendAsync(new EmailMessage(account.Email,
                "HMSS Admin Verification Code",
                $"Your verification code is: {code}\n\nThis code expires in 5 minutes."));

            return Ok(new SignInResponseDto
            {
                RequiresVerification = true,
                UserId = account.UserId,
                Role = account.Role,
                FullName = account.FullName,
            });
        }

        var token = _jwtService.GenerateToken(account.UserId, account.Role, account.Email);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtConfig.ExpiryMinutes);

        return Ok(new SignInResponseDto
        {
            Token = token,
            UserId = account.UserId,
            Role = account.Role,
            FullName = account.FullName,
            ExpiresAt = expiresAt
        });
    }

    /// <summary>
    /// Verify 6-digit code sent to admin email. Returns JWT on success.
    /// </summary>
    [HttpPost("verify-code")]
    public async Task<IActionResult> VerifyCode([FromBody] VerifyCodeRequestDto request)
    {
        var account = await _userRepo.FindByIdAsync(request.UserId);
        if (account == null || account.Role != "SystemAdmin")
            return Unauthorized(new { Message = "Invalid verification request" });

        var cacheKey = $"admin-2fa-{account.UserId}";
        if (!_cache.TryGetValue<string>(cacheKey, out var storedCode) || storedCode != request.Code)
            return Unauthorized(new { Message = "Invalid or expired verification code" });

        // Remove used code
        _cache.Remove(cacheKey);

        var token = _jwtService.GenerateToken(account.UserId, account.Role, account.Email);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtConfig.ExpiryMinutes);

        return Ok(new SignInResponseDto
        {
            Token = token,
            UserId = account.UserId,
            Role = account.Role,
            FullName = account.FullName,
            ExpiresAt = expiresAt
        });
    }

    [HttpPost("logout")]
    public new IActionResult SignOut() => Ok(new { Message = "Logged out" }); // Client-side token discard

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = ClaimsHelper.GetUserId(User);
        var account = await _userRepo.FindByIdAsync(userId);
        if (account == null) return NotFound();

        return Ok(new UserDto
        {
            UserId = account.UserId,
            FullName = account.FullName,
            Email = account.Email,
            Role = account.Role,
            AccountStatus = account.AccountStatus
        });
    }
}
