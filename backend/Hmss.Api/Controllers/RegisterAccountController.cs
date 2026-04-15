using Hmss.Api.DTOs.Auth;
using Hmss.Api.Entities;
using Hmss.Api.Logic;
using Hmss.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/auth/register")]
public class RegisterAccountController : ControllerBase
{
    private readonly IUserAccountRepository _userRepo;
    private readonly AuthenticationLogic _logic;

    public RegisterAccountController(IUserAccountRepository userRepo, AuthenticationLogic logic)
    {
        _userRepo = userRepo;
        _logic = logic;
    }

    [HttpGet]
    public IActionResult GetRegistrationForm() =>
        Ok(new RegistrationFormResponseDto());

    [HttpPost]
    public async Task<IActionResult> RegisterAccount([FromBody] RegistrationDto request)
    {
        var validation = await _logic.ValidateRegistrationAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { Errors = validation.Errors });

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var account = UserAccount.Create(request.FullName, request.Email, request.Phone, passwordHash, request.Role);
        var saved = await _userRepo.SaveAsync(account);

        return Created($"/api/auth/me", new RegistrationResponseDto
        {
            UserId = saved.UserId,
            Email = saved.Email,
            Role = saved.Role,
            Message = "Account created successfully"
        });
    }
}
