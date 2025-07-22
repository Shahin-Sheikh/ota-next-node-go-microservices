namespace AdminService.Application.DTOs.Room;

public record CreateRoomDto(
    Guid HotelId,
    string RoomNumber,
    string RoomType,
    string Description,
    decimal PricePerNight,
    int MaxOccupancy,
    int BedCount,
    string BedType,
    bool HasPrivateBathroom,
    bool HasBalcony,
    string ImageUrl
);

public record UpdateRoomDto(
    string RoomNumber,
    string RoomType,
    string Description,
    decimal PricePerNight,
    int MaxOccupancy,
    int BedCount,
    string BedType,
    bool HasPrivateBathroom,
    bool HasBalcony,
    bool IsAvailable,
    string ImageUrl
);

public record RoomResponseDto(
    Guid Id,
    Guid HotelId,
    string RoomNumber,
    string RoomType,
    string Description,
    decimal PricePerNight,
    int MaxOccupancy,
    int BedCount,
    string BedType,
    bool HasPrivateBathroom,
    bool HasBalcony,
    bool IsAvailable,
    string ImageUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IEnumerable<RoomAmenityResponseDto> Amenities
);

public record RoomAmenityResponseDto(
    Guid Id,
    string Name,
    string Description,
    string IconUrl,
    bool IsActive
);

public record HotelAmenityResponseDto(
    Guid Id,
    string Name,
    string Description,
    string IconUrl,
    bool IsActive
);
