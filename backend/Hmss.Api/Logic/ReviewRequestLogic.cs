using Hmss.Api.Entities;
namespace Hmss.Api.Logic;
public class ReviewRequestLogic
{
    public ValidationResult ValidateAcceptance(RentalRequest request, RoomListing listing)
    {
        var errors = new List<string>();
        if (request.Status != "Pending") errors.Add("Request must be Pending to accept");
        if (listing.Status != "PublishedAvailable") errors.Add("Listing must be PublishedAvailable to lock");
        return new ValidationResult(errors.Count == 0, errors);
    }
}
