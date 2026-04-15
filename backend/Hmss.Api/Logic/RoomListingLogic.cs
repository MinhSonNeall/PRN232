using Hmss.Api.DTOs.Listing;
using Hmss.Api.Entities;
namespace Hmss.Api.Logic;
public class RoomListingLogic
{
    public ValidationResult ValidateRequiredFields(RoomListingDraftDto request)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(request.Title)) errors.Add("Title is required");
        if (request.Price <= 0) errors.Add("Price must be greater than 0");
        if (request.Capacity <= 0) errors.Add("Capacity must be greater than 0");
        if (string.IsNullOrWhiteSpace(request.FurnishedStatus)) errors.Add("Furnished status is required");
        if (string.IsNullOrWhiteSpace(request.PrivateWCStatus)) errors.Add("WC status is required");
        return new ValidationResult(errors.Count == 0, errors);
    }

    public ValidationResult ValidateUpdates(RoomListing entity, RoomListingUpdateDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Title)) return new ValidationResult(false, new() { "Title is required" });
        return new ValidationResult(true, new());
    }
}
