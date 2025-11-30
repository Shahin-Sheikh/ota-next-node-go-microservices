const { producer } = require("../config/kafka.config");

const TOPICS = {
  HOTEL_CREATED: "hotel.created",
  HOTEL_UPDATED: "hotel.updated",
  HOTEL_DELETED: "hotel.deleted",
  HOTEL_STATUS_CHANGED: "hotel.status.changed",
};

class KafkaProducerService {
  async publishHotelCreated(hotelData) {
    try {
      await producer.send({
        topic: TOPICS.HOTEL_CREATED,
        messages: [
          {
            key: hotelData._id,
            value: JSON.stringify({
              eventType: "HOTEL_CREATED",
              timestamp: new Date().toISOString(),
              data: hotelData,
            }),
          },
        ],
      });
      console.log(`📤 Hotel created event published: ${hotelData._id}`);
    } catch (error) {
      console.error("Error publishing hotel created event:", error.message);
    }
  }

  async publishHotelUpdated(hotelData) {
    try {
      await producer.send({
        topic: TOPICS.HOTEL_UPDATED,
        messages: [
          {
            key: hotelData._id,
            value: JSON.stringify({
              eventType: "HOTEL_UPDATED",
              timestamp: new Date().toISOString(),
              data: hotelData,
            }),
          },
        ],
      });
      console.log(`📤 Hotel updated event published: ${hotelData._id}`);
    } catch (error) {
      console.error("Error publishing hotel updated event:", error.message);
    }
  }

  async publishHotelStatusChanged(hotelId, status) {
    try {
      await producer.send({
        topic: TOPICS.HOTEL_STATUS_CHANGED,
        messages: [
          {
            key: hotelId,
            value: JSON.stringify({
              eventType: "HOTEL_STATUS_CHANGED",
              timestamp: new Date().toISOString(),
              data: { hotelId, status },
            }),
          },
        ],
      });
      console.log(`📤 Hotel status changed event published: ${hotelId}`);
    } catch (error) {
      console.error(
        "Error publishing hotel status changed event:",
        error.message
      );
    }
  }

  async publishHotelDeleted(hotelId) {
    try {
      await producer.send({
        topic: TOPICS.HOTEL_DELETED,
        messages: [
          {
            key: hotelId,
            value: JSON.stringify({
              eventType: "HOTEL_DELETED",
              timestamp: new Date().toISOString(),
              data: { hotelId },
            }),
          },
        ],
      });
      console.log(`📤 Hotel deleted event published: ${hotelId}`);
    } catch (error) {
      console.error("Error publishing hotel deleted event:", error.message);
    }
  }
}

module.exports = new KafkaProducerService();
