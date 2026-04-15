using Hmss.Api.Entities;
namespace Hmss.Api.Logic;
public class ListingControlLogic
{
    public ValidationResult ValidateDisableAction(RoomListing listing)
    {
        if (listing.Status == "Archived")
            return new ValidationResult(false, new() { "Listing is already archived" });
        return new ValidationResult(true, new());
    }
}
