require("dotenv").config();
const mongoose = require("mongoose");
const Service = require("./models/service.model");
const User = require("./models/user.model");
const UserService = require("./models/user-service.model");

const MONGODB_URI =
  "MONGO_URI=mongodb+srv://root:1234@cluster0.zqqkmng.mongodb.net/ota-auth-db";

async function seedData() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("Connected to MongoDB Atlas successfully");

    // Clear existing data
    console.log("Clearing existing data...");
    await Promise.all([
      Service.deleteMany({}),
      User.deleteMany({}),
      UserService.deleteMany({}),
    ]);

    // Create test service
    console.log("Creating test service...");
    const testService = new Service({
      name: "Customer",
      code: "ota_customer",
      secret: "a8f#OcKn>M/5d4t1X)W^",
    });
    await testService.save();

    // Create test user
    console.log("Creating test user...");
    const testUser = new User({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "password123",
      phone: "+1234567890",
      dob: new Date(1990, 0, 1),
    });
    await testUser.save();

    // Create relationship
    console.log("Creating user-service relationship...");
    const userService = new UserService({
      user: testUser._id,
      service: testService._id,
      serviceSecret: "a8f#OcKn>M/5d4t1X)W^",
    });
    await userService.save();

    console.log("✅ Seeding completed successfully");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    if (err.name === "MongooseServerSelectionError") {
      console.error(
        "Check your: \n1. Internet connection\n2. MongoDB Atlas credentials\n3. IP whitelisting in Atlas"
      );
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedData();
