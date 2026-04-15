using Hmss.Api.Entities;
namespace Hmss.Api.Logic;
public class PublishListingLogic
{
    public ValidationResult ValidateEligibility(RoomListing listing, bool isOwnerVerified)
    {
        var errors = new List<string>();
        if (listing.Status != "Draft") errors.Add("Only Draft listings can be published");
        if (!isOwnerVerified) errors.Add("Owner must be verified before publishing listings");
        if (string.IsNullOrWhiteSpace(listing.ImagesRef)) errors.Add("Listing must have at least one image");
        return new ValidationResult(errors.Count == 0, errors);
    }
}
