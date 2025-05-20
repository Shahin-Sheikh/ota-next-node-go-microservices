// Admin CRUD Operations

const Hotel = require("../models/hotels.model");
const RoomType = require("../models/room-type.model");

const createHotel = async (req, res) => {
  try {
    const hotelData = req.body;
    const hotel = await Hotel.create(hotelData);
    res.status(201).json(hotel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.findAll({
      where: { isActive: true },
      include: [{ model: RoomType }],
    });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id, {
      include: [{ model: RoomType }],
    });
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateHotel = async (req, res) => {
  try {
    const [updated] = await Hotel.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedHotel = await Hotel.findByPk(req.params.id);
      return res.json(updatedHotel);
    }
    throw new Error("Hotel not found");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const deleted = await Hotel.update(
      { isActive: false },
      { where: { id: req.params.id } }
    );
    if (deleted) {
      return res.json({ message: "Hotel deactivated" });
    }
    throw new Error("Hotel not found");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Room Type Operations

const addRoomType = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    const roomTypeData = { ...req.body, HotelId: hotel.id };
    const roomType = await RoomType.create(roomTypeData);
    res.status(201).json(roomType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateRoomType = async (req, res) => {
  try {
    const [updated] = await RoomType.update(req.body, {
      where: { id: req.params.roomTypeId },
    });
    if (updated) {
      const updatedRoomType = await RoomType.findByPk(req.params.roomTypeId);
      return res.json(updatedRoomType);
    }
    throw new Error("Room type not found");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Search Functionality

const searchHotels = async (req, res) => {
  try {
    const { city, checkIn, checkOut, guests, page = 1, limit = 10 } = req.query;

    // Basic search by city
    const whereClause = {
      city: { [Op.iLike]: `%${city}%` },
      isActive: true,
    };

    // Find available hotels with room types that can accommodate the guests
    const hotels = await Hotel.findAll({
      where: whereClause,
      include: [
        {
          model: RoomType,
          where: {
            maxOccupancy: { [Op.gte]: guests },
            quantityAvailable: { [Op.gt]: 0 },
          },
        },
      ],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });

    // Add availability check based on dates (would require a Reservation model)
    // This is a simplified version - in production you'd need to check against actual bookings

    const response = hotels.map((hotel) => ({
      id: hotel.id,
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      starRating: hotel.starRating,
      amenities: hotel.amenities,
      images: hotel.images,
      roomsAvailable: hotel.RoomTypes.map((room) => ({
        id: room.id,
        name: room.name,
        maxOccupancy: room.maxOccupancy,
        pricePerNight: room.pricePerNight,
        amenities: room.amenities,
        images: room.images,
      })),
    }));

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  addRoomType,
  updateRoomType,
  searchHotels,
};
