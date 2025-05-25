const Service = require("../models/service.model");

// In-memory cache for services
const serviceCache = new Map();

const validateService = async (serviceSecret) => {
  try {
    // Check cache first
    if (serviceCache.has(serviceSecret)) {
      return serviceCache.get(serviceSecret);
    }

    // Query from database
    const service = await Service.findOne({ secret: serviceSecret });

    if (!service) {
      console.warn(`No service found for code: ${serviceSecret}`);
      return null;
    }

    // Cache the result
    serviceCache.set(serviceSecret, service);

    return service;
  } catch (error) {
    console.error("Error validating service:", error);
    return null;
  }
};

module.exports = {
  validateService,
};
