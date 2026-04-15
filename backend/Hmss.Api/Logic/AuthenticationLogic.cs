using Hmss.Api.DTOs.Auth;
using Hmss.Api.Repositories.Interfaces;

namespace Hmss.Api.Logic;

public record ValidationResult(bool IsValid, List<string> Errors);

public class AuthenticationLogic
{
    private readonly IUserAccountRepository _userRepo;

    public AuthenticationLogic(IUserAccountRepository userRepo)
    {
        _userRepo = userRepo;
    }

    public async Task<ValidationResult> ValidateRegistrationAsync(RegistrationDto request)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(request.FullName))
            errors.Add("Full name is required");

        if (string.IsNullOrWhiteSpace(request.Email))
            errors.Add("Email is required");

        if (string.IsNullOrWhiteSpace(request.Phone))
            errors.Add("Phone is required");

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            errors.Add("Password must be at least 6 characters");

        if (!new[] { "Tenant", "Owner" }.Contains(request.Role))
            errors.Add("Role must be Tenant or Owner");

        if (errors.Count == 0)
        {
            var existing = await _userRepo.FindByEmailAsync(request.Email);
            if (existing != null)
                errors.Add("Email is already registered");
        }

        return new ValidationResult(errors.Count == 0, errors);
    }
}
