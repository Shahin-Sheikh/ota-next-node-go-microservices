const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "hotel-service",
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : ["localhost:9092"],
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "hotel-service-group" });

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log("✅ Kafka Producer connected");
  } catch (error) {
    console.error("❌ Kafka Producer connection failed:", error.message);
  }
};

const connectConsumer = async () => {
  try {
    await consumer.connect();
    console.log("✅ Kafka Consumer connected");
  } catch (error) {
    console.error("❌ Kafka Consumer connection failed:", error.message);
  }
};

const disconnectProducer = async () => {
  try {
    await producer.disconnect();
    console.log("Kafka Producer disconnected");
  } catch (error) {
    console.error("Error disconnecting Kafka Producer:", error.message);
  }
};

const disconnectConsumer = async () => {
  try {
    await consumer.disconnect();
    console.log("Kafka Consumer disconnected");
  } catch (error) {
    console.error("Error disconnecting Kafka Consumer:", error.message);
  }
};

module.exports = {
  kafka,
  producer,
  consumer,
  connectProducer,
  connectConsumer,
  disconnectProducer,
  disconnectConsumer,
};
