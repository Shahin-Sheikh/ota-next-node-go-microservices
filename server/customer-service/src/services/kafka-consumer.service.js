const { consumer } = require("../config/kafka.config");

const TOPICS = {
  HOTEL_CREATED: "hotel.created",
  HOTEL_UPDATED: "hotel.updated",
  HOTEL_DELETED: "hotel.deleted",
  HOTEL_STATUS_CHANGED: "hotel.status.changed",
};

class KafkaConsumerService {
  constructor() {
    this.isRunning = false;
  }

  async startConsumer() {
    if (this.isRunning) {
      console.log("Kafka consumer is already running");
      return;
    }

    try {
      await consumer.subscribe({
        topics: Object.values(TOPICS),
        fromBeginning: false,
      });

      this.isRunning = true;

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const event = JSON.parse(message.value.toString());
            console.log(
              `📥 Received event: ${topic} - ${event.eventType}`,
              event.data
            );

            // Handle different event types
            switch (topic) {
              case TOPICS.HOTEL_CREATED:
                await this.handleHotelCreated(event.data);
                break;
              case TOPICS.HOTEL_UPDATED:
                await this.handleHotelUpdated(event.data);
                break;
              case TOPICS.HOTEL_STATUS_CHANGED:
                await this.handleHotelStatusChanged(event.data);
                break;
              case TOPICS.HOTEL_DELETED:
                await this.handleHotelDeleted(event.data);
                break;
              default:
                console.log(`Unknown topic: ${topic}`);
            }
          } catch (error) {
            console.error("Error processing message:", error.message);
          }
        },
      });

      console.log("✅ Kafka Consumer started listening to hotel events");
    } catch (error) {
      console.error("Error starting Kafka consumer:", error.message);
      this.isRunning = false;
    }
  }

  async handleHotelCreated(hotelData) {
    // You can implement caching logic here
    // For example, update a local cache or database
    console.log("Processing hotel created event:", hotelData._id);
    // TODO: Implement your business logic here
    // e.g., Update cache, trigger notifications, etc.
  }

  async handleHotelUpdated(hotelData) {
    console.log("Processing hotel updated event:", hotelData._id);
    // TODO: Implement your business logic here
    // e.g., Invalidate cache, update local data, etc.
  }

  async handleHotelStatusChanged(data) {
    console.log(
      `Processing hotel status changed event: ${data.hotelId} -> ${data.status}`
    );
    // TODO: Implement your business logic here
  }

  async handleHotelDeleted(data) {
    console.log("Processing hotel deleted event:", data.hotelId);
    // TODO: Implement your business logic here
    // e.g., Remove from cache, cleanup related data, etc.
  }

  async stopConsumer() {
    if (this.isRunning) {
      this.isRunning = false;
      console.log("Kafka Consumer stopped");
    }
  }
}

module.exports = new KafkaConsumerService();
