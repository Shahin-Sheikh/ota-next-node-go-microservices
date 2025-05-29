const bcrypt = require("bcryptjs");
const ServiceRegistry = require("../models/service-registry.model");

exports.validateServiceSecret = async (req, res, next) => {
  const serviceSecret = req.headers["service-secret"];

  if (!serviceSecret) {
    return res.status(401).json({
      success: false,
      message: "Service secret is required",
    });
  }

  try {
    const service = await ServiceRegistry.findOne({}).select("+serviceSecret");

    if (!service) {
      return res.status(401).json({
        success: false,
        message: "Invalid service configuration",
      });
    }

    const isMatch = await bcrypt.compare(serviceSecret, service.serviceSecret);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid service secret",
      });
    }

    req.service = service.serviceName;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
