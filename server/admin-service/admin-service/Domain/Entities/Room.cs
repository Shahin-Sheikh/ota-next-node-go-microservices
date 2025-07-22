using AdminService.Domain.Common;

namespace AdminService.Domain.Entities;

public class Room : BaseEntity
{
    public Guid HotelId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public int MaxOccupancy { get; set; }
    public int BedCount { get; set; }
    public string BedType { get; set; } = string.Empty;
    public bool HasPrivateBathroom { get; set; }
    public bool HasBalcony { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string ImageUrl { get; set; } = string.Empty;

    // Navigation properties
    public Hotel Hotel { get; set; } = null!;
    public ICollection<RoomAmenity> Amenities { get; set; } = new List<RoomAmenity>();
}
