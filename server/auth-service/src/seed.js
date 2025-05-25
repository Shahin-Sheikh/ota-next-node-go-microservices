require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Service = require("./models/service.model");
const User = require("./models/user.model");
const UserService = require("./models/user-service.model");

const MONGODB_URI =
  "mongodb+srv://root:1234@cluster0.zqqkmng.mongodb.net/ota-auth-db";

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
    await Service.deleteMany({});
    await User.deleteMany({});
    await UserService.deleteMany({});

    // Create test services
    console.log("Creating test services...");
    const services = [
      {
        name: "Admin",
        code: "ota_admin",
        secret: ")X'^#</Nd2jS%AurN>-Q",
      },
      {
        name: "Customer",
        code: "ota_customer",
        secret: "kL8$pD!vF*eR5@qW2#zY",
      },
      {
        name: "Partner",
        code: "ota_partner",
        secret: "/VT,AOyD[B]t5@CJYX7h",
      },
    ];

    const createdServices = await Service.insertMany(services);

    // Create test users
    console.log("Creating test users...");
    const hashedPassword = await bcrypt.hash("password123", 12);

    const users = [
      {
        firstName: "admin",
        lastName: "user",
        email: "admin@example.com",
        password: hashedPassword,
        phone: "+12345678901",
        dob: new Date(1990, 0, 1),
        role: "admin",
      },
      {
        firstName: "customer",
        lastName: "user",
        email: "customer@example.com",
        password: hashedPassword,
        phone: "+12345678902",
        dob: new Date(1995, 5, 15),
      },
      {
        firstName: "partner",
        lastName: "user",
        email: "partner@example.com",
        password: hashedPassword,
        phone: "+12345678903",
        dob: new Date(1985, 10, 20),
      },
    ];

    const createdUsers = await User.insertMany(users);

    // Create user-service relationships
    console.log("Creating user-service relationships...");
    const relationships = [
      {
        user: createdUsers[0]._id, // Admin user
        service: createdServices[0]._id, // Admin portal
      },
      {
        user: createdUsers[1]._id, // Customer user
        service: createdServices[1]._id, // Customer app
      },
      {
        user: createdUsers[2]._id, // Partner user
        service: createdServices[2]._id, // Partner portal
      },
      // Admin has access to all services
      {
        user: createdUsers[0]._id, // Admin user
        service: createdServices[1]._id, // Customer app
      },
      {
        user: createdUsers[0]._id, // Admin user
        service: createdServices[2]._id, // Partner portal
      },
    ];

    await UserService.insertMany(relationships);

    console.log("✅ Seeding completed successfully");
    console.log("\nTest Users Created:");
    console.log("------------------");
    createdUsers.forEach((user) => {
      console.log(
        `Email: ${user.email} | Password: password123 | Role: ${
          user.role || "user"
        }`
      );
    });

    console.log("\nTest Services Available:");
    console.log("-----------------------");
    createdServices.forEach((service) => {
      console.log(`Name: ${service.name} | Code: ${service.code}`);
    });
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
