const db = require("../models");
const Hotel = db.Hotel;
const Room = db.Room;
const { Op } = require("sequelize");

// Admin CRUD Operations
const createHotel = async (req, res) => {
  try {
    const hotelData = req.body;
    hotelData.createdBy = req.user.id;
    const hotel = await Hotel.create(hotelData);
    res.status(201).json({
      data: hotel,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllHotels = async (req, res) => {
  try {
    const { status, searchKey } = req.query;
    const whereClause = {};

    if (status) whereClause.status = status;

    if (searchKey) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${searchKey}%` } },
        { description: { [Op.iLike]: `%${searchKey}%` } },
        { "$location.city$": { [Op.iLike]: `%${searchKey}%` } },
        { "$location.country$": { [Op.iLike]: `%${searchKey}%` } },
        { "$address.street$": { [Op.iLike]: `%${searchKey}%` } },
      ];
    }

    const hotels = await Hotel.findAll({
      where: whereClause,
      include: [{ model: Room, as: "rooms" }],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      data: hotels,
    });
  } catch (error) {
    console.log("full error", error);
    res.status(500).json({ error: error.message });
  }
};

const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id, {
      include: [{ model: Room, as: "rooms" }],
    });
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    res.json({
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateHotel = async (req, res) => {
  try {
    const [updated] = await Hotel.update(req.body, {
      where: { _id: req.params.id },
    });
    if (updated) {
      const updatedHotel = await Hotel.findByPk(req.params.id);
      return res.json({
        data: updatedHotel,
      });
    }
    throw new Error("Hotel not found");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const activateHotel = async (req, res) => {
  try {
    const [updated] = await Hotel.update(
      { status: "active" },
      { where: { _id: req.params.id } }
    );
    if (updated) return res.json({ message: "Hotel activated" });
    throw new Error("Hotel not found");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deactivateHotel = async (req, res) => {
  try {
    const [updated] = await Hotel.update(
      { status: "inactive" },
      { where: { _id: req.params.id } }
    );
    if (updated) return res.json({ message: "Hotel deactivated" });
    throw new Error("Hotel not found");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Room Operations
const addRoom = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.hotelId);
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });

    const room = await Room.create({
      ...req.body,
      hotelId: hotel._id,
    });

    res.status(201).json({
      data: room,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const [updated] = await Room.update(req.body, {
      where: { _id: req.params.roomId },
    });
    if (updated) {
      const updatedRoom = await Room.findByPk(req.params.roomId);
      return res.json({ data: updatedRoom });
    }
    throw new Error("Room not found");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Search Functionality
const searchHotels = async (req, res) => {
  try {
    const { searchKey, page = 1, limit = 10 } = req.query;
    const whereClause = {};

    if (searchKey) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${searchKey}%` } },
        { description: { [Op.iLike]: `%${searchKey}%` } },
        { "$location.city$": { [Op.iLike]: `%${searchKey}%` } },
        { "$location.country$": { [Op.iLike]: `%${searchKey}%` } },
        { "$address.street$": { [Op.iLike]: `%${searchKey}%` } },
      ];
    }

    const hotels = await Hotel.findAll({
      where: whereClause,
      include: [{ model: Room, as: "rooms" }],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      data: hotels,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  activateHotel,
  deactivateHotel,
  addRoom,
  updateRoom,
  searchHotels,
};
