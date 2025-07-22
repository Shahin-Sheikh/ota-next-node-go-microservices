using AdminService.Application.DTOs.Room;

namespace AdminService.Application.DTOs.Hotel;

public record CreateHotelDto(
    string Name,
    string Description,
    string Address,
    string City,
    string Country,
    string PostalCode,
    decimal Latitude,
    decimal Longitude,
    int StarRating,
    string ContactPhone,
    string ContactEmail,
    string ImageUrl
);

public record UpdateHotelDto(
    string Name,
    string Description,
    string Address,
    string City,
    string Country,
    string PostalCode,
    decimal Latitude,
    decimal Longitude,
    int StarRating,
    string ContactPhone,
    string ContactEmail,
    bool IsActive,
    string ImageUrl
);

public record HotelResponseDto(
    Guid Id,
    string Name,
    string Description,
    string Address,
    string City,
    string Country,
    string PostalCode,
    decimal Latitude,
    decimal Longitude,
    int StarRating,
    string ContactPhone,
    string ContactEmail,
    bool IsActive,
    string ImageUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IEnumerable<RoomResponseDto> Rooms,
    IEnumerable<HotelAmenityResponseDto> Amenities
);

public record HotelSummaryDto(
    Guid Id,
    string Name,
    string City,
    string Country,
    int StarRating,
    bool IsActive,
    string ImageUrl,
    int RoomCount
);

public record HotelSearchDto(
    string? SearchTerm,
    string? City,
    string? Country,
    int? MinStarRating,
    int? MaxStarRating,
    bool? IsActive
);
