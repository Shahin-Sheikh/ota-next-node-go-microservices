// utils/http-call/index.js
const ApiClient = require("../api-client.utils");
const { HOTEL_SERVICE_URL } = require("../../config/db.config");

const hotelClient = new ApiClient(HOTEL_SERVICE_URL);

module.exports = {
  searchHotels: (params) => hotelClient.get("/api/hotels", params),
  getHotelDetails: (hotelId) => hotelClient.get(`/api/hotels/${hotelId}`),
  // Add more HTTP endpoints here
};
