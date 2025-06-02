const bcrypt = require("bcryptjs");
const ServiceRegistry = require("../models/service-registry.model");
const createServiceUserModel = require("../models/service-user-factory.model");

// Initialize service (one-time setup)
exports.initializeService = async (req, res) => {
  try {
    const { serviceName, serviceSecret, allowedDomains } = req.body;

    if (
      !["admin", "accounting", "inventory", "shipping"].includes(serviceName)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid service name",
      });
    }

    const existingService = await ServiceRegistry.findOne({ serviceName });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service already initialized",
      });
    }

    const hashedSecret = await bcrypt.hash(serviceSecret, 12);

    const service = await ServiceRegistry.create({
      serviceName,
      serviceSecret: hashedSecret,
      allowedDomains: allowedDomains || [],
    });

    // Create the collection by initializing the model
    createServiceUserModel(serviceName);

    res.status(201).json({
      success: true,
      data: {
        id: service._id,
        serviceName: service.serviceName,
        allowedDomains: service.allowedDomains,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
