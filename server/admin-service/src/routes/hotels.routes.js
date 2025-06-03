const express = require("express");
const router = express.Router();
const controller = require("../controllers/hotels.controller");
const authenticate = require("../middleware/auth.middleware");

// Admin CRUD Routes
router.post("/", authenticate, controller.createHotel);
router.get("/", authenticate, controller.getAllHotels);
router.get("/:id", authenticate, controller.getHotelById);
router.put("/:id", authenticate, controller.updateHotel);
router.patch("/:id/activate", authenticate, controller.activateHotel);
router.patch("/:id/deactivate", authenticate, controller.deactivateHotel);

// Room Management Routes
router.post("/:hotelId/rooms", authenticate, controller.addRoom);
router.put("/:hotelId/rooms/:roomId", authenticate, controller.updateRoom);

// Search Routes
router.get("/search/all", controller.searchHotels);

module.exports = router;
