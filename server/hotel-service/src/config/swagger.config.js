const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hotel Service API",
      version: "1.0.0",
      description:
        "Hotel service API for managing hotels, rooms, inventory, and booking operations in the OTA platform.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5003}`,
        description: "Development server",
      },
      {
        url: "/",
        description: "Current server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token from auth service",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            error: {
              type: "string",
              example: "Detailed error information",
            },
          },
        },
        Hotel: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Grand Plaza Hotel",
            },
            address: {
              type: "string",
              example: "123 Main Street, New York",
            },
            city: {
              type: "string",
              example: "New York",
            },
            country: {
              type: "string",
              example: "USA",
            },
            rating: {
              type: "number",
              format: "float",
              example: 4.5,
            },
            description: {
              type: "string",
              example: "Luxury hotel in the heart of the city",
            },
            amenities: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["WiFi", "Pool", "Gym", "Restaurant"],
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Room: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            hotelId: {
              type: "integer",
              example: 1,
            },
            roomType: {
              type: "string",
              example: "Deluxe",
            },
            price: {
              type: "number",
              format: "float",
              example: 199.99,
            },
            capacity: {
              type: "integer",
              example: 2,
            },
            available: {
              type: "boolean",
              example: true,
            },
            description: {
              type: "string",
              example: "Spacious room with city view",
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Hotels",
        description: "Hotel management endpoints",
      },
      {
        name: "Rooms",
        description: "Room management endpoints",
      },
      {
        name: "Bookings",
        description: "Booking operations",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
