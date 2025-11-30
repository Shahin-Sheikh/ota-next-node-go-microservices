const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotel.controller");

/**
 * @swagger
 * /api/hotels/list:
 *   get:
 *     summary: Get all hotels
 *     tags: [Hotels]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (active/inactive)
 *       - in: query
 *         name: searchKey
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of hotels
 *       500:
 *         description: Server error
 */
router.get("/list", hotelController.getAllHotels);

/**
 * @swagger
 * /api/hotels/{hotelId}:
 *   get:
 *     summary: Get hotel by ID
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel details
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Server error
 */
router.get("/:hotelId", hotelController.getHotelById);

/**
 * @swagger
 * /api/hotels/search/query:
 *   get:
 *     summary: Search hotels
 *     tags: [Hotels]
 *     parameters:
 *       - in: query
 *         name: searchKey
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Search results
 *       500:
 *         description: Server error
 */
router.get("/search/query", hotelController.searchHotels);

/**
 * @swagger
 * /api/hotels/health/check:
 *   get:
 *     summary: Check hotel service health
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: Health status
 */
router.get("/health/check", hotelController.hotelServiceHealth);

module.exports = router;
