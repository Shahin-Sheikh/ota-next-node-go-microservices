const axios = require("axios");

const HOTEL_SERVICE_URL =
  process.env.HOTEL_SERVICE_URL || "http://localhost:5003";

/**
 * Hotel Service Client
 * This is an HTTP client that will be replaced with gRPC in the future
 * Keep the interface consistent for easy migration
 */
class HotelServiceClient {
  constructor() {
    this.baseURL = HOTEL_SERVICE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error("Hotel Service API Error:", error.message);
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            "Hotel service unavailable"
        );
      }
    );
  }

  /**
   * Get all hotels (public endpoint)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Hotels list with pagination
   */
  async getAllHotels(params = {}) {
    try {
      const response = await this.client.get("/api/hotels/public/list", {
        params,
      });
      return response;
    } catch (error) {
      console.error("Error fetching hotels:", error.message);
      throw error;
    }
  }

  /**
   * Get hotel by ID (public endpoint)
   * @param {string} hotelId - Hotel ID
   * @returns {Promise<Object>} - Hotel details
   */
  async getHotelById(hotelId) {
    try {
      const response = await this.client.get(`/api/hotels/public/${hotelId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching hotel ${hotelId}:`, error.message);
      throw error;
    }
  }

  /**
   * Search hotels
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} - Search results
   */
  async searchHotels(params = {}) {
    try {
      const response = await this.client.get("/api/hotels/search/all", {
        params,
      });
      return response;
    } catch (error) {
      console.error("Error searching hotels:", error.message);
      throw error;
    }
  }

  /**
   * Check if hotel service is healthy
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      await this.client.get("/health");
      return true;
    } catch (error) {
      console.error("Hotel service health check failed:", error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new HotelServiceClient();
