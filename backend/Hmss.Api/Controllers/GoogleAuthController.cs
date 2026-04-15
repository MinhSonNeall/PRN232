using Hmss.Api.Auth;
using Hmss.Api.Entities;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/auth/google")]
public class GoogleAuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _http;
    private readonly IUserAccountRepository _userRepo;
    private readonly JwtTokenService _jwt;

    public GoogleAuthController(
        IConfiguration config,
        IHttpClientFactory http,
        IUserAccountRepository userRepo,
        JwtTokenService jwt)
    {
        _config   = config;
        _http     = http;
        _userRepo = userRepo;
        _jwt      = jwt;
    }

    // GET /api/auth/google → redirect to Google consent screen
    [HttpGet]
    public IActionResult Initiate()
    {
        var clientId    = _config["GoogleOAuth:ClientId"];
        var redirectUri = _config["GoogleOAuth:RedirectUri"];
        var scope       = Uri.EscapeDataString("openid email profile");
        var state       = Guid.NewGuid().ToString("N");

        // CSRF state stored in HttpOnly cookie
        Response.Cookies.Append("oauth_state", state, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            MaxAge   = TimeSpan.FromMinutes(5)
        });

        var googleUrl =
            $"https://accounts.google.com/o/oauth2/v2/auth" +
            $"?client_id={clientId}" +
            $"&redirect_uri={Uri.EscapeDataString(redirectUri!)}" +
            $"&response_type=code" +
            $"&scope={scope}" +
            $"&state={state}" +
            $"&access_type=offline";

        return Redirect(googleUrl);
    }

    // GET /api/auth/google/callback?code=...&state=...
    [HttpGet("callback")]
    public async Task<IActionResult> Callback(
        [FromQuery] string? code,
        [FromQuery] string? state,
        [FromQuery] string? error)
    {
        var frontendBase = _config["GoogleOAuth:FrontendCallbackUrl"];

        if (error != null)
            return Redirect($"{frontendBase}?error=access_denied");

        // CSRF validation
        var savedState = Request.Cookies["oauth_state"];
        if (savedState != state)
            return Redirect($"{frontendBase}?error=invalid_state");

        Response.Cookies.Delete("oauth_state");

        try
        {
            var googleUser = await ExchangeCodeForUserAsync(code!);

            if (!googleUser.VerifiedEmail)
                return Redirect($"{frontendBase}?error=unverified_email");

            var (token, role) = await IssueTokenForGoogleUserAsync(googleUser);
            return Redirect($"{frontendBase}?token={token}&role={role}");
        }
        catch (Exception ex) when (ex.Message == "Account is disabled")
        {
            return Redirect($"{frontendBase}?error=account_disabled");
        }
        catch
        {
            return Redirect($"{frontendBase}?error=auth_failed");
        }
    }

    // Exchange authorization code for Google user profile info
    private async Task<GoogleUserInfo> ExchangeCodeForUserAsync(string code)
    {
        var client = _http.CreateClient();

        // Step 1: exchange code for access token
        var tokenResponse = await client.PostAsync(
            "https://oauth2.googleapis.com/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["code"]          = code,
                ["client_id"]     = _config["GoogleOAuth:ClientId"]!,
                ["client_secret"] = _config["GoogleOAuth:ClientSecret"]!,
                ["redirect_uri"]  = _config["GoogleOAuth:RedirectUri"]!,
                ["grant_type"]    = "authorization_code"
            }));

        tokenResponse.EnsureSuccessStatusCode();
        var tokenJson   = await tokenResponse.Content.ReadFromJsonAsync<JsonElement>();
        var accessToken = tokenJson.GetProperty("access_token").GetString()!;

        // Step 2: fetch user profile with access token
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        var profileResponse = await client.GetAsync(
            "https://www.googleapis.com/oauth2/v2/userinfo");
        profileResponse.EnsureSuccessStatusCode();

        return await profileResponse.Content.ReadFromJsonAsync<GoogleUserInfo>()
               ?? throw new Exception("Failed to parse Google user info");
    }

    // Find existing user by email, or auto-create as Tenant
    private async Task<(string token, string role)> IssueTokenForGoogleUserAsync(GoogleUserInfo googleUser)
    {
        var existing = await _userRepo.FindByEmailAsync(googleUser.Email);

        if (existing != null)
        {
            if (existing.AccountStatus == "Disabled")
                throw new Exception("Account is disabled");

            var existingToken = _jwt.GenerateToken(existing.UserId, existing.Role, existing.Email);
            return (existingToken, existing.Role);
        }

        // New user — auto-register as Tenant
        var newUser  = UserAccount.CreateForGoogle(googleUser.Email, googleUser.Name);
        await _userRepo.SaveAsync(newUser);

        var newToken = _jwt.GenerateToken(newUser.UserId, newUser.Role, newUser.Email);
        return (newToken, newUser.Role);
    }
}

// Google OAuth user profile response
public record GoogleUserInfo(
    [property: JsonPropertyName("id")]             string GoogleId,
    [property: JsonPropertyName("email")]          string Email,
    [property: JsonPropertyName("name")]           string Name,
    [property: JsonPropertyName("verified_email")] bool VerifiedEmail
);
