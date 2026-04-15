using System.Security.Claims;

namespace Hmss.Api.Auth;

public static class ClaimsHelper
{
    public static Guid GetUserId(ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? user.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }

    public static string GetRole(ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
    }

    public static string? GetEmail(ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Email)
               ?? user.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email);
    }
}
