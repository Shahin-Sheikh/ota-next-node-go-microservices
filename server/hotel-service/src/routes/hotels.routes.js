const express = require("express");
const router = express.Router();
const controller = require("../controllers/hotels.controller");
const authenticate = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/hotels/public/list:
 *   get:
 *     summary: Get all active hotels (public)
 *     description: Retrieve a list of all active hotels available for public viewing
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: List of active hotels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hotel'
 *       500:
 *         description: Server error
 */
router.get("/public/list", controller.getAllHotelsPublic);

/**
 * @swagger
 * /api/hotels/public/{id}:
 *   get:
 *     summary: Get hotel by ID (public)
 *     description: Retrieve details of a specific hotel by ID for public viewing
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Server error
 */
router.get("/public/:id", controller.getHotelByIdPublic);

/**
 * @swagger
 * /api/hotels/search/all:
 *   get:
 *     summary: Search hotels
 *     description: Search hotels by various criteria
 *     tags: [Hotels]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Minimum rating
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by hotel name
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hotel'
 *       500:
 *         description: Server error
 */
router.get("/search/all", controller.searchHotels);

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: Create a new hotel
 *     description: Create a new hotel (Admin only)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - city
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *                 example: Grand Plaza Hotel
 *               address:
 *                 type: string
 *                 example: 123 Main Street
 *               city:
 *                 type: string
 *                 example: New York
 *               country:
 *                 type: string
 *                 example: USA
 *               rating:
 *                 type: number
 *                 format: float
 *                 example: 4.5
 *               description:
 *                 type: string
 *                 example: Luxury hotel in the heart of the city
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["WiFi", "Pool", "Gym"]
 *     responses:
 *       201:
 *         description: Hotel created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       400:
 *         description: Bad request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.post("/", authenticate, controller.createHotel);

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Get all hotels
 *     description: Retrieve all hotels (Admin only)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all hotels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hotel'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.get("/", authenticate, controller.getAllHotels);

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Get hotel by ID
 *     description: Retrieve a specific hotel by ID (Admin only)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */
router.get("/:id", authenticate, controller.getHotelById);

/**
 * @swagger
 * /api/hotels/{id}:
 *   put:
 *     summary: Update hotel
 *     description: Update an existing hotel (Admin only)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hotel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               rating:
 *                 type: number
 *                 format: float
 *               description:
 *                 type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Hotel updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       400:
 *         description: Bad request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticate, controller.updateHotel);

/**
 * @swagger
 * /api/hotels/{id}/activate:
 *   patch:
 *     summary: Activate hotel
 *     description: Activate a hotel (Admin only)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */
router.patch("/:id/activate", authenticate, controller.activateHotel);

/**
 * @swagger
 * /api/hotels/{id}/deactivate:
 *   patch:
 *     summary: Deactivate hotel
 *     description: Deactivate a hotel (Admin only)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */
router.patch("/:id/deactivate", authenticate, controller.deactivateHotel);

/**
 * @swagger
 * /api/hotels/{hotelId}/rooms:
 *   post:
 *     summary: Add room to hotel
 *     description: Add a new room to a hotel (Admin only)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hotel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomType
 *               - price
 *               - capacity
 *             properties:
 *               roomType:
 *                 type: string
 *                 example: Deluxe
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 199.99
 *               capacity:
 *                 type: integer
 *                 example: 2
 *               available:
 *                 type: boolean
 *                 example: true
 *               description:
 *                 type: string
 *                 example: Spacious room with city view
 *     responses:
 *       201:
 *         description: Room added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: Bad request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Server error
 */
router.post("/:hotelId/rooms", authenticate, controller.addRoom);

/**
 * @swagger
 * /api/hotels/{hotelId}/rooms/{roomId}:
 *   put:
 *     summary: Update room
 *     description: Update an existing room (Admin only)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hotel ID
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomType:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               capacity:
 *                 type: integer
 *               available:
 *                 type: boolean
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: Bad request
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Hotel or room not found
 *       500:
 *         description: Server error
 */
router.put("/:hotelId/rooms/:roomId", authenticate, controller.updateRoom);

module.exports = router;
