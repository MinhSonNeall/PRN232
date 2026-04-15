using Hmss.Api.Entities;
namespace Hmss.Api.Logic;
public class ReopenLogic
{
    public ValidationResult ValidateConcurrencyStatus(RentalRequest request)
    {
        if (request.Status != "Accepted")
            return new ValidationResult(false, new() { "Only Accepted arrangements can be reopened" });
        return new ValidationResult(true, new());
    }
}
