const hotelServiceClient = require("../services/hotel-service.client");

/**
 * Get all hotels
 * This endpoint fetches hotels from hotel-service via HTTP
 */
const getAllHotels = async (req, res) => {
  try {
    const { status, searchKey, page, limit } = req.query;

    const params = {};
    if (status) params.status = status;
    if (searchKey) params.searchKey = searchKey;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const result = await hotelServiceClient.getAllHotels(params);

    res.json(result);
  } catch (error) {
    console.error("Error in getAllHotels controller:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch hotels from hotel service",
      message: error.message,
    });
  }
};

/**
 * Get hotel by ID
 */
const getHotelById = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const result = await hotelServiceClient.getHotelById(hotelId);

    res.json(result);
  } catch (error) {
    console.error(`Error in getHotelById controller:`, error.message);
    res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      error: "Failed to fetch hotel details",
      message: error.message,
    });
  }
};

/**
 * Search hotels
 */
const searchHotels = async (req, res) => {
  try {
    const { searchKey, page, limit } = req.query;

    const params = {};
    if (searchKey) params.searchKey = searchKey;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const result = await hotelServiceClient.searchHotels(params);

    res.json(result);
  } catch (error) {
    console.error("Error in searchHotels controller:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to search hotels",
      message: error.message,
    });
  }
};

/**
 * Health check for hotel service
 */
const hotelServiceHealth = async (req, res) => {
  try {
    const isHealthy = await hotelServiceClient.healthCheck();

    res.json({
      success: true,
      hotelServiceHealthy: isHealthy,
      message: isHealthy
        ? "Hotel service is available"
        : "Hotel service is unavailable",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      hotelServiceHealthy: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllHotels,
  getHotelById,
  searchHotels,
  hotelServiceHealth,
};
