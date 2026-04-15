using Hmss.Api.DTOs.Listing;

namespace Hmss.Api.Entities;

public class RoomListing
{
    public Guid ListingId { get; private set; }
    public Guid PropertyId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public decimal Price { get; private set; }
    public int Capacity { get; private set; }
    public string? Amenities { get; private set; }       // JSON array string
    public DateOnly AvailableFrom { get; private set; }
    public string FurnishedStatus { get; private set; } = string.Empty; // FullyFurnished|PartiallyFurnished|Unfurnished
    public string PrivateWCStatus { get; private set; } = string.Empty; // Private|Shared|None
    public string? ImagesRef { get; private set; }       // JSON array of URLs
    public string Status { get; private set; } = "Draft"; // Draft|PublishedAvailable|Locked|Hidden|Archived
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public DateTime? PublishedAt { get; private set; }

    // Navigation
    public Property? Property { get; private set; }

    private RoomListing() { }

    public static RoomListing Create(Guid propertyId, string title, string? description, decimal price, int capacity,
        string? amenities, DateOnly availableFrom, string furnishedStatus, string privateWCStatus, string? imagesRef)
    {
        return new RoomListing
        {
            ListingId = Guid.NewGuid(),
            PropertyId = propertyId,
            Title = title,
            Description = description,
            Price = price,
            Capacity = capacity,
            Amenities = amenities,
            AvailableFrom = availableFrom,
            FurnishedStatus = furnishedStatus,
            PrivateWCStatus = privateWCStatus,
            ImagesRef = imagesRef,
            Status = "Draft",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public StatusChangeResult Publish()
    {
        if (Status != "Draft")
            return new StatusChangeResult(false, $"Cannot publish listing with status {Status}");
        Status = "PublishedAvailable";
        PublishedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        return new StatusChangeResult(true);
    }

    public StatusChangeResult Lock()
    {
        if (Status != "PublishedAvailable")
            return new StatusChangeResult(false, $"Cannot lock listing with status {Status}");
        Status = "Locked";
        UpdatedAt = DateTime.UtcNow;
        return new StatusChangeResult(true);
    }

    public StatusChangeResult Reopen()
    {
        if (Status != "Locked")
            return new StatusChangeResult(false, $"Cannot reopen listing with status {Status}");
        Status = "PublishedAvailable";
        UpdatedAt = DateTime.UtcNow;
        return new StatusChangeResult(true);
    }

    public StatusChangeResult Hide()
    {
        if (Status != "PublishedAvailable")
            return new StatusChangeResult(false, $"Cannot hide listing with status {Status}");
        Status = "Hidden";
        UpdatedAt = DateTime.UtcNow;
        return new StatusChangeResult(true);
    }

    public StatusChangeResult Show()
    {
        if (Status != "Hidden")
            return new StatusChangeResult(false, $"Cannot show listing with status {Status}");
        Status = "PublishedAvailable";
        UpdatedAt = DateTime.UtcNow;
        return new StatusChangeResult(true);
    }

    public StatusChangeResult Archive()
    {
        if (Status == "Archived")
            return new StatusChangeResult(false, "Listing is already archived");
        Status = "Archived";
        UpdatedAt = DateTime.UtcNow;
        return new StatusChangeResult(true);
    }

    public StatusChangeResult ApplyUpdates(RoomListingUpdateDto request, List<string> newImageUrls)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return new StatusChangeResult(false, "Title cannot be empty");

        Title = request.Title;
        Description = request.Description;
        Price = request.Price;
        Capacity = request.Capacity;
        Amenities = request.Amenities;
        AvailableFrom = request.AvailableFrom;
        FurnishedStatus = request.FurnishedStatus;
        PrivateWCStatus = request.PrivateWCStatus;

        // Always update images — empty list clears them, non-empty replaces
        ImagesRef = newImageUrls.Count > 0
            ? System.Text.Json.JsonSerializer.Serialize(newImageUrls)
            : null;

        UpdatedAt = DateTime.UtcNow;
        return new StatusChangeResult(true);
    }
}
