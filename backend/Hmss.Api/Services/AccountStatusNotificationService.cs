using Hmss.Api.Entities;
using Hmss.Api.Gateways.Interfaces;
namespace Hmss.Api.Services;
public class AccountStatusNotificationService
{
    public EmailMessage ComposeStatusChangedEmail(UserAccount account, string newStatus)
    {
        var subject = newStatus switch
        {
            "Suspended" => "Account Suspended",
            "Disabled" => "Account Disabled",
            "Active" => "Account Enabled",
            _ => "Account Status Changed"
        };
        var body = $"Your account status has been changed to: {newStatus}. Contact support if you have questions.";
        return new EmailMessage(account.Email, subject, body);
    }
}
