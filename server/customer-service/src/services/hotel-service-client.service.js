const axios = require("axios");
const { HOTEL_SERVICE_URL } = require("../config/db.config");

class HotelServiceClient {
  async searchHotels(params) {
    const response = await axios.get(`${HOTEL_SERVICE_URL}/api/hotels/search`, {
      params,
    });
    return response.data;
  }

  async getHotelWithRooms(hotelId, params) {
    const [hotel, rooms] = await Promise.all([
      axios.get(`${HOTEL_SERVICE_URL}/api/hotels/${hotelId}`),
      axios.get(`${HOTEL_SERVICE_URL}/api/hotels/${hotelId}/rooms/available`, {
        params,
      }),
    ]);

    return {
      ...hotel.data,
      availableRooms: rooms.data,
    };
  }
}

module.exports = new HotelServiceClient();
