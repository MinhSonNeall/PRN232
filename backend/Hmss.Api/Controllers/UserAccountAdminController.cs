using Hmss.Api.Auth;
using Hmss.Api.DTOs.Admin;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Repositories.Interfaces;
using Hmss.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hmss.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Policy = "SystemAdminOnly")]
public class UserAccountAdminController : ControllerBase
{
    private readonly IUserAccountRepository _userRepo;
    private readonly AccountStatusNotificationService _notificationService;
    private readonly IEmailGateway _email;

    public UserAccountAdminController(IUserAccountRepository userRepo, AccountStatusNotificationService notificationService, IEmailGateway email)
    {
        _userRepo = userRepo;
        _notificationService = notificationService;
        _email = email;
    }

    [HttpGet]
    public async Task<IActionResult> GetUserAccountList()
    {
        var users = await _userRepo.FindManageableUserAccountsAsync();
        return Ok(users.Select(u => new UserAccountSummaryDto { UserId = u.UserId, FullName = u.FullName, Email = u.Email, Role = u.Role, AccountStatus = u.AccountStatus }));
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetUserAccountDetail(Guid userId)
    {
        var user = await _userRepo.FindByIdAsync(userId);
        if (user == null) return NotFound();

        var currentAdminId = ClaimsHelper.GetUserId(User);
        var actions = user.AccountStatus switch
        {
            "Active" => new List<string> { "Suspend", "Disable" },
            "Suspended" => new List<string> { "Enable", "Disable" },
            "Disabled" => new List<string> { "Enable" },
            _ => new List<string>()
        };
        // Self-protection: admin cannot disable their own account
        if (user.UserId == currentAdminId) actions.Remove("Disable");

        return Ok(new UserAccountDetailResponseDto
        {
            UserId = user.UserId, FullName = user.FullName, Email = user.Email,
            Phone = user.Phone, Role = user.Role, AccountStatus = user.AccountStatus,
            CreatedAt = user.CreatedAt, AvailableActions = actions
        });
    }

    [HttpPost("{userId:guid}/suspend")]
    public async Task<IActionResult> SuspendAccount(Guid userId) => await ChangeStatus(userId, "Suspend");

    [HttpPost("{userId:guid}/enable")]
    public async Task<IActionResult> EnableAccount(Guid userId) => await ChangeStatus(userId, "Enable");

    [HttpPost("{userId:guid}/disable")]
    public async Task<IActionResult> DisableAccount(Guid userId)
    {
        var currentAdminId = ClaimsHelper.GetUserId(User);
        if (userId == currentAdminId) return BadRequest(new { Error = "Admins cannot disable their own account" });
        return await ChangeStatus(userId, "Disable");
    }

    private async Task<IActionResult> ChangeStatus(Guid userId, string action)
    {
        var user = await _userRepo.FindByIdAsync(userId);
        if (user == null) return NotFound();

        var result = user.ChangeStatus(action);
        if (!result.Success) return BadRequest(new { Error = result.ErrorMessage });

        await _userRepo.UpdateAsync(user);

        var emailMsg = _notificationService.ComposeStatusChangedEmail(user, user.AccountStatus);
        _email.SendAsync(emailMsg);

        return Ok(new ChangeUserAccountStatusResponseDto { UserId = user.UserId, NewStatus = user.AccountStatus, Message = $"Account {action.ToLower()}d successfully" });
    }
}
