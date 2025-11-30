const express = require("express");
const router = express.Router();
const controller = require("../controllers/hotels.controller");
const authenticate = require("../middleware/auth.middleware");

// Public Routes (for customer service and public access)
router.get("/public/list", controller.getAllHotelsPublic);
router.get("/public/:id", controller.getHotelByIdPublic);
router.get("/search/all", controller.searchHotels);

// Admin CRUD Routes (protected)
router.post("/", authenticate, controller.createHotel);
router.get("/", authenticate, controller.getAllHotels);
router.get("/:id", authenticate, controller.getHotelById);
router.put("/:id", authenticate, controller.updateHotel);
router.patch("/:id/activate", authenticate, controller.activateHotel);
router.patch("/:id/deactivate", authenticate, controller.deactivateHotel);

// Room Management Routes
router.post("/:hotelId/rooms", authenticate, controller.addRoom);
router.put("/:hotelId/rooms/:roomId", authenticate, controller.updateRoom);

module.exports = router;
