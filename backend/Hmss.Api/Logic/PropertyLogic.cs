using Hmss.Api.DTOs.Property;
using Hmss.Api.Entities;
namespace Hmss.Api.Logic;
public class PropertyLogic
{
    public ValidationResult ValidateUpdate(Property entity, PropertyUpdateDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return new ValidationResult(false, new() { "Name cannot be empty" });
        return new ValidationResult(true, new());
    }
}
