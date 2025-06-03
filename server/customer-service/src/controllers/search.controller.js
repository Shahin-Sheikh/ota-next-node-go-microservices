const hotelServiceClient = require("../services/hotel-service-client.service");

module.exports = {
  searchHotels: async (req, res) => {
    try {
      const { destination, checkInDate, checkOutDate, guests, sortBy } =
        req.query;

      if (!destination || !checkInDate || !checkOutDate) {
        return res.status(400).json({
          error: "Destination, check-in and check-out dates are required",
        });
      }

      const results = await hotelServiceClient.searchHotels({
        destination,
        checkInDate,
        checkOutDate,
        guests: guests || 1,
        sortBy: sortBy || "price",
      });

      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.error || "Failed to search hotels",
      });
    }
  },

  getHotelWithAvailableRooms: async (req, res) => {
    try {
      const { hotelId } = req.params;
      const { checkInDate, checkOutDate, guests } = req.query;

      const result = await hotelServiceClient.getHotelWithRooms(hotelId, {
        checkInDate,
        checkOutDate,
        guests,
      });

      res.json(result);
    } catch (error) {
      console.error("Hotel details error:", error);
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.error || "Failed to fetch hotel details",
      });
    }
  },
};
