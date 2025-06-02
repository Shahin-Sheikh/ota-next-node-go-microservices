const bcrypt = require("bcryptjs/dist/bcrypt");
const ServiceRegistry = require("../models/service-registry.model");
const createServiceUserModel = require("../models/service-user-factory.model");
const { generateTokens, addRefreshToken } = require("../utils/token.utils");

exports.registerServiceUser = async (req, res) => {
  try {
    console.log("[REGISTER] Service Info:", req.serviceInfo); // Debug log
    console.log("[REGISTER] Request Body:", req.body); // Debug log

    if (!req.serviceInfo || !req.serviceInfo.serviceName) {
      console.error("Service info missing in controller");
      return res.status(401).json({
        success: false,
        message: "Service validation missing",
      });
    }

    const ServiceUser = createServiceUserModel(req.serviceInfo.serviceName);
    console.log("[REGISTER] ServiceUser model created"); // Debug log

    // Rest of your registration logic...
    const { firstName, lastName, agentId, email, password } = req.body;

    // Check if user exists
    const existingUser = await ServiceUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Create user
    const user = await ServiceUser.create({
      firstName,
      lastName,
      agentId,
      email,
      password,
      service: req.serviceInfo.serviceName,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id,
      req.serviceInfo.serviceName
    );
    await addRefreshToken(user, refreshToken, req.serviceInfo.serviceName);

    return res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        service: user.service,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
exports.loginServiceUser = async (req, res) => {
  try {
    const serviceSecret = req.headers["service-secret"];
    if (!serviceSecret) {
      return res.status(401).json({
        success: false,
        message: "Service secret required",
      });
    }

    // Find and validate service secret (using bcrypt comparison)
    const services = await ServiceRegistry.find({}).select("+serviceSecret");
    let validService = null;

    for (const service of services) {
      if (await bcrypt.compare(serviceSecret, service.serviceSecret)) {
        validService = service;
        break;
      }
    }

    if (!validService) {
      return res.status(401).json({
        success: false,
        message: "Invalid service secret",
      });
    }

    const { email, password } = req.body;
    const ServiceUser = createServiceUserModel(validService.serviceName);

    // Find user with password
    const user = await ServiceUser.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id,
      validService.serviceName
    );
    await addRefreshToken(user, refreshToken, validService.serviceName);

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        service: user.service,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
