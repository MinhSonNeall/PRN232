namespace Hmss.Api.Entities;

public class UserAccount
{
    public Guid UserId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string Role { get; private set; } = string.Empty; // Tenant | Owner | SystemAdmin
    public string AccountStatus { get; private set; } = "Active"; // Active | Suspended | Disabled
    public DateTime CreatedAt { get; private set; }

    private UserAccount() { } // EF Core

    public static UserAccount Create(string fullName, string email, string phone, string passwordHash, string role)
    {
        return new UserAccount
        {
            UserId = Guid.NewGuid(),
            FullName = fullName,
            Email = email,
            Phone = phone,
            PasswordHash = passwordHash,
            Role = role,
            AccountStatus = "Active",
            CreatedAt = DateTime.UtcNow
        };
    }

    // Google OAuth auto-registration — creates Tenant account with random unusable password
    public static UserAccount CreateForGoogle(string email, string fullName)
    {
        return new UserAccount
        {
            UserId       = Guid.NewGuid(),
            FullName     = fullName,
            Email        = email,
            Phone        = string.Empty,
            // Random password hash — Google users never use password login
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
            Role         = "Tenant",
            AccountStatus = "Active",
            CreatedAt    = DateTime.UtcNow
        };
    }

    // UC-17 state mutation
    public StatusChangeResult ChangeStatus(string action)
    {
        var newStatus = (AccountStatus, action) switch
        {
            ("Active", "Suspend") => "Suspended",
            ("Active", "Disable") => "Disabled",
            ("Suspended", "Enable") => "Active",
            ("Suspended", "Disable") => "Disabled",
            ("Disabled", "Enable") => "Active",
            _ => null
        };

        if (newStatus == null)
            return new StatusChangeResult(false, $"Cannot {action} account with status {AccountStatus}");

        AccountStatus = newStatus;
        return new StatusChangeResult(true);
    }
}
