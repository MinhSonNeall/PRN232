using Hmss.Api.DTOs.Property;
namespace Hmss.Api.Services;
public class PropertyService
{
    public Logic.ValidationResult ValidatePropertyFields(PropertyDto request)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(request.Name)) errors.Add("Name is required");
        if (string.IsNullOrWhiteSpace(request.Address)) errors.Add("Address is required");
        return new Logic.ValidationResult(errors.Count == 0, errors);
    }
}
