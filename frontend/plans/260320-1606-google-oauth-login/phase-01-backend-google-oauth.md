# Phase 1: Backend — Google OAuth Handler

**Priority:** Critical | **Effort:** 1.5h | **Status:** Planned

## Overview

Add Google OAuth 2.0 endpoints to the ASP.NET Core backend. Uses raw HTTP calls to Google APIs (no extra NuGet package needed — avoids ASP.NET Identity dependency).

## Google Cloud Setup (One-Time, Manual)

1. Go to https://console.cloud.google.com → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID → Web application
3. Authorized redirect URI: `http://localhost:5236/api/auth/google/callback`
4. Copy **Client ID** and **Client Secret** → add to `appsettings.json`

## Related Code Files

- **Modify:** `backend/Hmss.Api/appsettings.json` — add Google OAuth config
- **Create:** `backend/Hmss.Api/Controllers/GoogleAuthController.cs`
- **Modify:** `backend/Hmss.Api/Program.cs` — register HttpClient

## appsettings.json Addition

```json
"GoogleOAuth": {
  "ClientId": "",
  "ClientSecret": "",
  "RedirectUri": "http://localhost:5236/api/auth/google/callback",
  "FrontendCallbackUrl": "http://localhost:3000/login/google-callback"
}
```

## GoogleAuthController

```csharp
[ApiController]
[Route("api/auth/google")]
public class GoogleAuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _http;
    // injected in Phase 2:
    private readonly IUserAccountRepository _userRepo;
    private readonly JwtTokenService _jwt;

    // GET /api/auth/google → redirect to Google consent screen
    [HttpGet]
    public IActionResult Initiate()
    {
        var clientId    = _config["GoogleOAuth:ClientId"];
        var redirectUri = _config["GoogleOAuth:RedirectUri"];
        var scope       = Uri.EscapeDataString("openid email profile");
        var state       = Guid.NewGuid().ToString("N"); // CSRF token

        // Store state in cookie for validation in callback
        Response.Cookies.Append("oauth_state", state, new CookieOptions
        {
            HttpOnly = true, SameSite = SameSiteMode.Lax, MaxAge = TimeSpan.FromMinutes(5)
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
    public async Task<IActionResult> Callback([FromQuery] string code,
                                              [FromQuery] string state,
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
            var googleUser = await ExchangeCodeForUserAsync(code);
            // Phase 2: find/create user, issue JWT
            var (token, role) = await IssueTokenForGoogleUserAsync(googleUser);
            return Redirect($"{frontendBase}?token={token}&role={role}");
        }
        catch
        {
            return Redirect($"{frontendBase}?error=auth_failed");
        }
    }

    // Exchange auth code for Google user info
    private async Task<GoogleUserInfo> ExchangeCodeForUserAsync(string code)
    {
        var client = _http.CreateClient();

        // Step 1: exchange code for tokens
        var tokenResponse = await client.PostAsync("https://oauth2.googleapis.com/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["code"]          = code,
                ["client_id"]     = _config["GoogleOAuth:ClientId"]!,
                ["client_secret"] = _config["GoogleOAuth:ClientSecret"]!,
                ["redirect_uri"]  = _config["GoogleOAuth:RedirectUri"]!,
                ["grant_type"]    = "authorization_code"
            }));

        tokenResponse.EnsureSuccessStatusCode();
        var tokenJson = await tokenResponse.Content.ReadFromJsonAsync<JsonElement>();
        var accessToken = tokenJson.GetProperty("access_token").GetString()!;

        // Step 2: fetch user profile
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
        var profileResponse = await client.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
        profileResponse.EnsureSuccessStatusCode();

        return await profileResponse.Content.ReadFromJsonAsync<GoogleUserInfo>()
               ?? throw new Exception("Failed to parse Google user info");
    }
}

// Value object for Google user profile
public record GoogleUserInfo(
    [property: JsonPropertyName("id")]             string GoogleId,
    [property: JsonPropertyName("email")]          string Email,
    [property: JsonPropertyName("name")]           string Name,
    [property: JsonPropertyName("verified_email")] bool VerifiedEmail
);
```

## Program.cs Changes

```csharp
builder.Services.AddHttpClient();  // register IHttpClientFactory
```

## Implementation Steps

1. Create `GoogleUserInfo` record (in same file or separate DTOs file)
2. Create `GoogleAuthController.cs` with `Initiate` + `Callback`
3. Add Google OAuth config to `appsettings.json`
4. Register `AddHttpClient()` in `Program.cs`
5. Build: `dotnet build` — verify 0 errors

## Security Considerations

- CSRF state token stored in HttpOnly cookie (not query param)
- State validated before processing callback
- `error` param from Google short-circuits safely
- Client Secret never exposed to frontend — stays in backend config

## Success Criteria

- `GET /api/auth/google` redirects to Google
- After Google consent, callback fires and reaches `ExchangeCodeForUserAsync`
- Build: 0 errors
