const bcrypt = require("bcryptjs");
const ServiceRegistry = require("../models/service-registry.model");

exports.validateServiceSecret = async (req, res, next) => {
  const serviceSecret = req.headers["service-secret"];

  console.log("[DEBUG] Received service secret header:", serviceSecret); // Debug log

  if (!serviceSecret) {
    console.log("[ERROR] No service secret provided");
    return res.status(401).json({
      success: false,
      message: "Service secret required",
    });
  }

  try {
    console.log("[DEBUG] Fetching services from registry...");
    const services = await ServiceRegistry.find({}).select("+serviceSecret");

    if (!services.length) {
      console.log("[ERROR] No services found in registry");
      return res.status(500).json({
        success: false,
        message: "No services registered",
      });
    }

    for (const service of services) {
      console.log(`[DEBUG] Comparing against service: ${service.serviceName}`);
      console.log(`[DEBUG] Stored hash: ${service.serviceSecret}`);

      const isMatch = await bcrypt.compare(
        serviceSecret,
        service.serviceSecret
      );
      console.log(`[DEBUG] Comparison result: ${isMatch}`);

      if (isMatch) {
        console.log(
          `[SUCCESS] Valid secret for service: ${service.serviceName}`
        );
        req.serviceInfo = {
          serviceName: service.serviceName,
          allowedDomains: service.allowedDomains,
        };
        return next();
      }
    }

    console.log("[ERROR] No matching service found for provided secret");
    return res.status(401).json({
      success: false,
      message: "Invalid service secret",
    });
  } catch (err) {
    console.error("[ERROR] Service validation error:", err);
    res.status(500).json({
      success: false,
      message: "Service validation failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
