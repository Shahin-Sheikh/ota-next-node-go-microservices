const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const { connectDB } = require("./config/db.config");
const swaggerSpec = require("./config/swagger.config");
const {
  connectConsumer,
  disconnectConsumer,
} = require("./config/kafka.config");
const kafkaConsumer = require("./services/kafka-consumer.service");

dotenv.config();

const PORT = process.env.PORT || 5002;

// Initialize Express app
const app = express();

// Connect to the database
connectDB();

// Trust proxy
app.set("trust proxy", 1);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : [
          "http://localhost:3000",
          "http://localhost:5173",
          "http://localhost:5174",
        ];
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV === "development"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Logging
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Customer Service API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  })
);

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Load routes
const customerRoutes = require("./routes/customer.route");
const hotelRoutes = require("./routes/hotel.route");

app.use("/api/customers", customerRoutes);
app.use("/api/hotels", hotelRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Customer Service is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Customer Service Running",
    documentation: `http://localhost:${PORT}/api-docs`,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Customer Service running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);

  // Connect Kafka Consumer and start listening
  await connectConsumer();
  await kafkaConsumer.startConsumer();
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await kafkaConsumer.stopConsumer();
  await disconnectConsumer();
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

module.exports = app;
