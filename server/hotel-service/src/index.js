const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config");
const {
  connectProducer,
  disconnectProducer,
} = require("./config/kafka.config");

dotenv.config();

const app = express();

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

// Load all models and setup associations
const db = require("./models");

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Hotel Service API Documentation",
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
const hotelsRoutes = require("./routes/hotels.routes");
app.use("/api/hotels", hotelsRoutes);

// Server
const PORT = process.env.PORT || 5003;

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hotel Service is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hotel Service Running",
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
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
});

db.sequelize
  .sync({ alter: true })
  .then(async () => {
    // Connect Kafka Producer
    await connectProducer();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Hotel Service running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("SIGTERM signal received: closing HTTP server");
      await disconnectProducer();
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;
