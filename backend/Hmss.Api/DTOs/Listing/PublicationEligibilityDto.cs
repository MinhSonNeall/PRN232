namespace Hmss.Api.DTOs.Listing;
public class PublicationEligibilityDto
{
    public bool Eligible { get; set; }
    public List<string> Blockers { get; set; } = new();
}
