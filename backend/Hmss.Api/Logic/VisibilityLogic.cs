using Hmss.Api.Entities;
namespace Hmss.Api.Logic;
public class VisibilityLogic
{
    public ValidationResult ValidateVisibilityAction(RoomListing listing, string action)
    {
        if (action == "Hide" && listing.Status != "PublishedAvailable")
            return new ValidationResult(false, new() { "Only PublishedAvailable listings can be hidden" });
        if (action == "Show" && listing.Status != "Hidden")
            return new ValidationResult(false, new() { "Only Hidden listings can be shown" });
        return new ValidationResult(true, new());
    }
}
