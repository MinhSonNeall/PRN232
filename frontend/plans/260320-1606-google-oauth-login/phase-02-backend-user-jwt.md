# Phase 2: Backend — User Find/Create + JWT Issue

**Priority:** Critical | **Effort:** 1h | **Status:** Planned
**Depends on:** Phase 1

## Overview

After verifying the Google user, find or auto-create a UserAccount, then issue the existing JWT. Google-authenticated users skip email/password — they're identified by email.

## Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Role for new Google users | Tenant (default) | Safest default; owner requires verification anyway |
| Duplicate email (existing account) | Log in as existing | Email is unique key — same person |
| Password for Google users | Empty string (BCrypt hash) | Column is required; Google users never use it |
| Google ID storage | Not stored | Email is sufficient identifier; avoids schema change |

## Related Code Files

- **Modify:** `backend/Hmss.Api/Controllers/GoogleAuthController.cs` — add `IssueTokenForGoogleUserAsync`
- **Modify:** `backend/Hmss.Api/Entities/UserAccount.cs` — add `CreateForGoogleUser` factory (if needed)
- **No DB migration needed** — reuses existing `UserAccounts` table

## IssueTokenForGoogleUserAsync Implementation

Add to `GoogleAuthController`:

```csharp
private async Task<(string token, string role)> IssueTokenForGoogleUserAsync(GoogleUserInfo googleUser)
{
    // Find existing account by email
    var existing = await _userRepo.FindByEmailAsync(googleUser.Email);

    if (existing != null)
    {
        // Existing user — check not disabled
        if (existing.AccountStatus == "Disabled")
            throw new Exception("Account is disabled");

        var token = _jwt.GenerateToken(existing.UserId, existing.Role, existing.Email);
        return (token, existing.Role);
    }

    // New user — auto-register as Tenant
    var newUser = UserAccount.CreateForGoogle(googleUser.Email, googleUser.Name);
    await _userRepo.SaveAsync(newUser);

    var newToken = _jwt.GenerateToken(newUser.UserId, newUser.Role, newUser.Email);
    return (newToken, newUser.Role);
}
```

## UserAccount Entity — Add Factory for Google Users

```csharp
// Add to UserAccount.cs alongside existing Create() method
public static UserAccount CreateForGoogle(string email, string fullName)
{
    return new UserAccount
    {
        UserId        = Guid.NewGuid(),
        Email         = email,
        FullName      = fullName,
        Phone         = string.Empty,        // not available from Google
        PasswordHash  = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // random, unusable
        Role          = "Tenant",
        AccountStatus = "Active",
        CreatedAt     = DateTime.UtcNow
    };
}
```

> Phone field: Google doesn't provide phone. Store empty string — user can update it later in profile settings.

## Constructor Injection Update

```csharp
public GoogleAuthController(
    IConfiguration config,
    IHttpClientFactory http,
    IUserAccountRepository userRepo,    // add
    JwtTokenService jwt)                // add
{
    _config   = config;
    _http     = http;
    _userRepo = userRepo;
    _jwt      = jwt;
}
```

## Edge Cases

| Case | Behavior |
|------|----------|
| Google returns unverified email | Reject — check `googleUser.VerifiedEmail == false` |
| Email already used with password login | Log in as that user (same email = same person) |
| Account suspended | Still allow login (suspension is for platform violations, not auth) |
| Account disabled | Throw → redirect to frontend with `error=account_disabled` |
| Google consent denied | `error=access_denied` from Phase 1 handles this |

## Implementation Steps

1. Add `CreateForGoogle()` factory to `UserAccount.cs`
2. Add `IssueTokenForGoogleUserAsync()` to `GoogleAuthController`
3. Update controller constructor to inject `IUserAccountRepository` + `JwtTokenService`
4. Add unverified email guard: `if (!googleUser.VerifiedEmail) throw new Exception("Unverified email")`
5. Build: `dotnet build` — 0 errors

## Success Criteria

- New Google user → `UserAccounts` row created with Role=Tenant
- Existing email → existing user's JWT returned (no duplicate row)
- Disabled account → frontend receives `?error=account_disabled`
- JWT token structure identical to password login JWT
