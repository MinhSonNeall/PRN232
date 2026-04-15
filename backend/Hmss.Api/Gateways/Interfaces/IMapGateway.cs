using Hmss.Api.DTOs.Room;
using Hmss.Api.DTOs.Search;
using Hmss.Api.Entities;

namespace Hmss.Api.Gateways.Interfaces;

public interface IMapGateway
{
    Task<List<LocationDataDto>> GetLocationDataAsync(List<RoomListing> listings);
    Task<List<PropertyLocationDataDto>> GetPropertyLocationDataAsync(List<PropertySearchSummaryDto> properties);
    Task<MapDto> GetMapDataAsync(string locationData);
}
