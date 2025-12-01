const bcrypt = require("bcryptjs/dist/bcrypt");
const ServiceRegistry = require("../models/service-registry.model");
const createServiceUserModel = require("../models/service-user-factory.model");
const { generateTokens, addRefreshToken } = require("../utils/token.utils");
const {
  logAuthAttempt,
  logSuspiciousActivity,
} = require("../utils/logger.utils");

/**
 * @swagger
 * /api/auth/service/register:
 *   post:
 *     summary: Register a new service user
 *     tags: [Service Authentication]
 *     security:
 *       - serviceSecret: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Smith
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.smith@admin-service.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *               agentId:
 *                 type: string
 *                 example: AGT-001
 *     responses:
 *       201:
 *         description: Service user registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid or missing service secret
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
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

    const { firstName, lastName, agentId, email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Check if user exists
    const existingUser = await ServiceUser.findOne({ email });
    if (existingUser) {
      logAuthAttempt(
        "service_register",
        email,
        false,
        ipAddress,
        "Email already exists"
      );
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
    await addRefreshToken(
      user,
      refreshToken,
      req.serviceInfo.serviceName,
      ipAddress,
      userAgent
    );

    logAuthAttempt("service_register", email, true, ipAddress);

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
    logSuspiciousActivity("service_registration_error", { error: err.message });
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
/**
 * @swagger
 * /api/auth/service/login:
 *   post:
 *     summary: Login as a service user
 *     tags: [Service Authentication]
 *     security:
 *       - serviceSecret: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.smith@admin-service.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials or service secret
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
exports.loginServiceUser = async (req, res) => {
  try {
    const serviceSecret = req.headers["service-secret"];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

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
      logSuspiciousActivity("invalid_service_secret_login", { ipAddress });
      return res.status(401).json({
        success: false,
        message: "Invalid service secret",
      });
    }

    const { email, password } = req.body;
    const ServiceUser = createServiceUserModel(validService.serviceName);

    // Find user with password
    const user = await ServiceUser.findOne({ email }).select(
      "+password +lockUntil"
    );

    if (!user) {
      logAuthAttempt(
        "service_login",
        email,
        false,
        ipAddress,
        "User not found"
      );
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      logAuthAttempt(
        "service_login",
        email,
        false,
        ipAddress,
        "Account locked"
      );
      return res.status(401).json({
        success: false,
        message:
          "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
      });
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      await user.incLoginAttempts();
      logAuthAttempt(
        "service_login",
        email,
        false,
        ipAddress,
        "Invalid password"
      );
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login info
    await ServiceUser.findByIdAndUpdate(user._id, {
      lastLogin: Date.now(),
      lastLoginIp: ipAddress,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id,
      validService.serviceName
    );
    await addRefreshToken(
      user,
      refreshToken,
      validService.serviceName,
      ipAddress,
      userAgent
    );

    logAuthAttempt("service_login", email, true, ipAddress);

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
    logSuspiciousActivity("service_login_error", { error: err.message });
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
