using Hmss.Api.Entities;
using Hmss.Api.Gateways.Interfaces;
namespace Hmss.Api.Services;
public class NotificationService
{
    public EmailMessage CreateDisableNotification(RoomListing listing)
    {
        return new EmailMessage("owner@hmss.local", "Listing Disabled by Admin",
            $"Your listing '{listing.Title}' has been disabled by the administrator.");
    }
}
