const db = require("../models");
const Hotel = db.Hotel;
const Room = db.Room;
const { Op } = require("sequelize");
// TODO: Kafka is disabled for now, will be enabled later
// const kafkaProducer = require("../services/kafka-producer.service");

// Admin CRUD Operations
const createHotel = async (req, res) => {
  try {
    const hotelData = req.body;
    hotelData.createdBy = req.user.id;
    const hotel = await Hotel.create(hotelData);

    // Publish event to Kafka
    // TODO: Kafka is disabled for now, will be enabled later
    // await kafkaProducer.publishHotelCreated(hotel.toJSON());

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

      // Publish event to Kafka
      // TODO: Kafka is disabled for now, will be enabled later
      // await kafkaProducer.publishHotelUpdated(updatedHotel.toJSON());

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
    if (updated) {
      // Publish event to Kafka
      // TODO: Kafka is disabled for now, will be enabled later
      // await kafkaProducer.publishHotelStatusChanged(req.params.id, "active");

      return res.json({ message: "Hotel activated" });
    }
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
    if (updated) {
      // Publish event to Kafka
      // TODO: Kafka is disabled for now, will be enabled later
      // await kafkaProducer.publishHotelStatusChanged(req.params.id, "inactive");

      return res.json({ message: "Hotel deactivated" });
    }
    throw new Error("Hotel not found");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Public endpoints (for customer service)
const getAllHotelsPublic = async (req, res) => {
  try {
    const { status = "active", searchKey, page = 1, limit = 50 } = req.query;
    const whereClause = { status };

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

    const totalCount = await Hotel.count({ where: whereClause });

    res.json({
      success: true,
      data: hotels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.log("full error", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getHotelByIdPublic = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      where: { _id: req.params.id, status: "active" },
      include: [{ model: Room, as: "rooms" }],
    });
    if (!hotel) {
      return res.status(404).json({ success: false, error: "Hotel not found" });
    }
    res.json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
  getAllHotelsPublic,
  getHotelByIdPublic,
};
