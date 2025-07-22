using AdminService.Domain.Common;

namespace AdminService.Domain.Entities;

public class HotelAmenity : BaseEntity
{
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Hotel Hotel { get; set; } = null!;
}

public class RoomAmenity : BaseEntity
{
    public Guid RoomId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Room Room { get; set; } = null!;
}
