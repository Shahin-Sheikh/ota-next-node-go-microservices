const express = require("express");
const router = express.Router();
const controller = require("../controllers/hotels.controller");
const authenticate = require("../middleware/auth.middleware");
//const authorizeRoles = require("../middleware/authorize.middleware");

// Admin CRUD Routes
router.post("/", authenticate, controller.createHotel);

router.get("/", authenticate, controller.getAllHotels);

router.get("/:id", authenticate, controller.getHotelById);

router.put("/:id", authenticate, controller.updateHotel);

router.patch("/:id/deactivate", authenticate, controller.deleteHotel);

// Room Type Management Routes
router.post("/:hotelId/room-types", authenticate, controller.addRoomType);

router.put(
  "/:hotelId/room-types/:roomTypeId",
  authenticate,
  controller.updateRoomType
);

// Public Search Route (no authentication required)
router.get("/search/availability", controller.searchHotels);

// Optional: Add these if you implement them later
// router.get("/:hotelId/reviews", controller.getHotelReviews);
// router.post("/:hotelId/bookings", authenticate, controller.createBooking);

module.exports = router;
